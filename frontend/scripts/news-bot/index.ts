
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cron from 'node-cron';
import slugify from 'slugify';
import sharp from 'sharp';
import { fetchLatestNews } from './rss';
import { rewriteContent, generateImagePrompt, generateSummary, translateContent, selectAuthorForCategory, AUTHOR_STYLES } from './llm';
import { generateImage } from './image';
import { backfillViews } from '../backfill-views';

dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env

// Initialize Supabase (Service Role Key needed for admin tasks like this)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables.');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Convert markdown formatting to HTML
function markdownToHtml(text: string): string {
  return text
    // Bold: **text** or __text__ → <strong>text</strong>
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_ → <em>text</em> (but not bullet points)
    .replace(/(?<!\s)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/(?<!\s)_([^_\n]+)_(?!_)/g, '<em>$1</em>')
    // Links: [text](url) → <a href="url">text</a>
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-red underline">$1</a>');
}

// SMART content formatter - preserves HTML structure, enhances spacing
function formatContent(rawContent: string): string {
  // Check if content already has proper HTML structure
  const hasHtmlStructure = /<(p|ul|ol|h2|blockquote)[^>]*>/i.test(rawContent);
  
  if (hasHtmlStructure) {
    // Content has HTML - just enhance it
    let html = rawContent
      // Convert any markdown bold to HTML
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Ensure spacing between elements
      .replace(/<\/p>\s*<p/g, '</p>\n\n<p')
      .replace(/<\/p>\s*<h2/g, '</p>\n\n<h2')
      .replace(/<\/h2>\s*<p/g, '</h2>\n\n<p')
      .replace(/<\/ul>\s*<p/g, '</ul>\n\n<p')
      .replace(/<\/ol>\s*<p/g, '</ol>\n\n<p')
      .replace(/<\/p>\s*<ul/g, '</p>\n\n<ul')
      .replace(/<\/p>\s*<ol/g, '</p>\n\n<ol')
      .replace(/<\/blockquote>\s*<p/g, '</blockquote>\n\n<p')
      // Add classes to elements for styling
      .replace(/<p>/g, '<p class="mb-8 leading-relaxed">')
      .replace(/<h2>/g, '<h2 class="text-2xl font-bold mt-12 mb-6">')
      .replace(/<ul>/g, '<ul class="my-8 space-y-3 list-disc pl-6">')
      .replace(/<ol>/g, '<ol class="my-8 space-y-3 list-decimal pl-6">')
      .replace(/<li>/g, '<li class="ml-2">')
      .replace(/<blockquote>/g, '<blockquote class="my-8 pl-6 border-l-4 border-brand-red italic">');
    
    return html;
  }
  
  // Fallback: Content is plain text - convert to HTML
  let text = rawContent
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let html = '';
  let inList = false;
  let listItems: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Convert markdown to HTML
    line = markdownToHtml(line);
    
    // Detect bullet points (dash or bullet char at start)
    const bulletMatch = line.match(/^[-•●◦▪]\s+(.+)$/) || line.match(/^(\d+)[.)]\s+(.+)$/);
    
    if (bulletMatch) {
      const bulletContent = bulletMatch[2] || bulletMatch[1];
      listItems.push(bulletContent);
      inList = true;
      continue;
    }
    
    // Close list if we were in one
    if (inList && listItems.length > 0) {
      html += '\n\n<ul class="my-8 space-y-3 list-disc pl-6">\n';
      listItems.forEach(item => {
        html += `  <li class="ml-2">${markdownToHtml(item)}</li>\n`;
      });
      html += '</ul>\n\n';
      listItems = [];
      inList = false;
    }
    
    // Detect headings
    const isHeading = (
      (line.length < 50 && !line.match(/[.,;:!?]$/)) ||
      /^(My Take|Sources|Analysis|Context|Challenges|Key (Points|Takeaways|Indicators?)|The .{5,30}$|What .{5,40}$)/i.test(line)
    );
    
    if (isHeading) {
      html += `\n\n<h2 class="text-2xl font-bold mt-12 mb-6">${line}</h2>\n\n`;
    } else {
      html += `\n\n<p class="mb-8 leading-relaxed">${line}</p>\n\n`;
    }
  }
  
  // Close any remaining list
  if (listItems.length > 0) {
    html += '\n\n<ul class="my-8 space-y-3 list-disc pl-6">\n';
    listItems.forEach(item => {
      html += `  <li class="ml-2">${markdownToHtml(item)}</li>\n`;
    });
    html += '</ul>\n\n';
  }
  
  return html.trim();
}

// Feeds to monitor
const RSS_FEEDS = [
  'https://cointelegraph.com/rss',
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://beincrypto.com/feed/'
];

// Extract image URLs from HTML content
function extractImagesFromContent(content: string): string[] {
  const images: string[] = [];
  
  // Match <img> tags
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const src = match[1];
    // Filter out small icons, tracking pixels, etc.
    if (src && !src.includes('pixel') && !src.includes('tracking') && !src.includes('icon') && !src.includes('logo')) {
      images.push(src);
    }
  }
  
  // Match figure tags with images
  const figureRegex = /<figure[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/figure>/gi;
  while ((match = figureRegex.exec(content)) !== null) {
    const src = match[1];
    if (src && !images.includes(src)) {
      images.push(src);
    }
  }
  
  return images.slice(0, 3); // Limit to 3 images max
}

// Guess initial category from title/content for author selection
function guessCategory(title: string, content: string): string {
  const text = (title + ' ' + content).toLowerCase();
  
  if (text.includes('bitcoin') || text.includes('btc')) return 'Bitcoin';
  if (text.includes('ethereum') || text.includes('eth') || text.includes('vitalik')) return 'Ethereum';
  if (text.includes('defi') || text.includes('yield') || text.includes('liquidity') || text.includes('aave') || text.includes('uniswap')) return 'DeFi';
  if (text.includes('nft') || text.includes('collectible') || text.includes('opensea')) return 'NFTs';
  if (text.includes('regulation') || text.includes('sec') || text.includes('congress') || text.includes('policy') || text.includes('law')) return 'Politics';
  if (text.includes('game') || text.includes('gaming') || text.includes('play-to-earn') || text.includes('p2e')) return 'Gaming';
  if (text.includes('metaverse') || text.includes('virtual') || text.includes('avatar')) return 'Culture';
  if (text.includes('bank') || text.includes('etf') || text.includes('institutional') || text.includes('wall street')) return 'Finance';
  if (text.includes('company') || text.includes('partnership') || text.includes('acquisition') || text.includes('funding')) return 'Business';
  if (text.includes('blockchain') || text.includes('protocol') || text.includes('layer') || text.includes('scaling')) return 'Technology';
  
  return 'Cryptocurrency'; // Default
}

async function runPipeline() {
  console.log('\n🚀 Starting News Pipeline: ' + new Date().toISOString());
  
  // 1. Fetch News
  const articles = await fetchLatestNews(RSS_FEEDS);

  for (const article of articles) {
    if (!article.link || !article.title) continue;

    // 2. Check Deduplication (using original_url)
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('original_url', article.link)
      .single();

    if (existing) {
      // console.log(`   ⏭️  Skipping duplicate: ${article.title.substring(0, 30)}...`);
      continue;
    }

    console.log(`\n✨ Processing: ${article.title}`);

    try {
      // Extract images from source content
      const sourceContent = article.content || article.contentSnippet || '';
      const allSourceImages = extractImagesFromContent(sourceContent);
      if (allSourceImages.length > 0) {
        console.log(`   📷 Found ${allSourceImages.length} source image(s)`);
      }
      
      // Guess category for author selection
      const guessedCategory = guessCategory(article.title, sourceContent);
      const selectedAuthor = selectAuthorForCategory(guessedCategory);
      console.log(`   👤 Selected author: ${selectedAuthor.name} (${guessedCategory})`);

      // Determine cover image first (from RSS feed metadata)
      const rssCoverImage = article.enclosure?.url || 
                           (article as any)['media:content']?.['$']?.url ||
                           (article as any)['media:thumbnail']?.['$']?.url ||
                           (article as any).image?.url ||
                           null;
      
      // Filter out the cover image from body images to avoid duplication
      const bodyImages = allSourceImages.filter(img => {
        if (!rssCoverImage) return true;
        // Compare image URLs (handle query params and slight variations)
        const normalizeUrl = (url: string) => url.split('?')[0].toLowerCase();
        return normalizeUrl(img) !== normalizeUrl(rssCoverImage);
      });
      
      if (bodyImages.length < allSourceImages.length) {
        console.log(`   🔄 Filtered out cover image from body (${allSourceImages.length} → ${bodyImages.length})`);
      }

      // 3. Rewrite Content with author-specific style
      console.log(`   🧠 Rewriting with ${selectedAuthor.name}'s voice...`);
      const ronContent = await rewriteContent(
        article.title, 
        article.contentSnippet || article.content || '', 
        article.link,
        bodyImages, // Pass only non-cover images
        selectedAuthor
      );
      
      if (!ronContent) {
        console.log('   ❌ Failed to rewrite content. Skipping.');
        continue;
      }

      // 4. Generate Image Prompt (Dedicated Step)
      console.log('   💭 Generating Image Prompt...');
      const imagePrompt = await generateImagePrompt(ronContent.title, ronContent.content);
      console.log(`   📝 Prompt: ${imagePrompt.substring(0, 50)}...`);

      // 5. Generate Image (Gemini - Nano Banana)
      console.log('   🎨 Generating Image...');
      
      // Default fallback if no source image
      let coverImageUrl = rssCoverImage || 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=1600';
      
      const imageBuffer = await generateImage(imagePrompt);
      
      if (imageBuffer) {
        // Process image with sharp (Convert to JPEG + Compress)
        const processedBuffer = await sharp(imageBuffer)
          .jpeg({ quality: 80, mozjpeg: true }) // Compress
          .resize(1200, 675, { fit: 'cover' }) // Standardize size (16:9)
          .toBuffer();

        const fileName = `ai-gen-${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('article-images')
          .upload(fileName, processedBuffer, {
            contentType: 'image/jpeg',
            cacheControl: '3600'
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('article-images')
            .getPublicUrl(fileName);
          coverImageUrl = publicUrlData.publicUrl;
          console.log('   ✅ AI Image processed & uploaded successfully (JPEG)');
        } else {
          console.error('   ⚠️ Image upload failed, using source image');
          if (rssCoverImage) {
            console.log('   📷 Using source image:', rssCoverImage.substring(0, 50) + '...');
          }
        }
      } else {
        // AI image generation failed, use source image
        if (rssCoverImage) {
          console.log('   📷 AI gen failed, using source image:', rssCoverImage.substring(0, 50) + '...');
        } else {
          console.log('   ⚠️ No source image, using default fallback');
        }
      }

      // 5. Publish to Supabase
      // Generate unique slug
      let baseSlug = slugify(ronContent.title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const { data: existing } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', slug)
          .single();
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      // Format content with proper HTML and spacing
      const formattedContent = formatContent(ronContent.content);
      
      // DEBUG: Show what we're saving
      console.log('   📝 RAW content from AI (first 200 chars):');
      console.log('   ' + ronContent.content.substring(0, 200));
      console.log('   📝 FORMATTED content (first 300 chars):');
      console.log('   ' + formattedContent.substring(0, 300));
      
      // 3.5 Generate AI Summary (Quick Read)
      console.log('   ⚡ Generating AI Quick Read...');
      const aiSummary = await generateSummary(ronContent.content);

      // Use excerpt from AI (plain text) or generate one
      const excerpt = ronContent.excerpt || ronContent.content.replace(/<[^>]*>/g, '').substring(0, 100);
      
      // Sanitize title - remove any HTML tags that LLM might have added
      const cleanTitle = ronContent.title.replace(/<[^>]*>/g, '').trim();
      
      const { data: insertedData, error: insertError } = await supabase
        .from('articles')
        .insert([{
          title: cleanTitle,
          slug: slug,
          excerpt: excerpt,
          summary: ronContent.summary || excerpt, // Fallback to excerpt if summary missing
          ai_summary: aiSummary,
          content: formattedContent,
          cover_image: coverImageUrl,
          category: ronContent.category || 'Technology',
          author_id: selectedAuthor.id,
          author_name: selectedAuthor.name,
          author_avatar: selectedAuthor.avatar,
          published: true,
          original_url: article.link,
          language: 'en',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) {
        console.error('   ❌ Database Insert Error:', insertError);
      } else {
        console.log(`   🎉 Published: ${ronContent.title}`);

        // 6. Localization (Phase 2)
        if (insertedData) {
          const LANGUAGES = ['es', 'fr', 'ar'];
          for (const lang of LANGUAGES) {
            try {
              console.log(`   🌐 Translating to ${lang}...`);
              const translatedTitle = await translateContent(ronContent.title, lang, false);
              const translatedContent = await translateContent(formattedContent, lang, true);
              const translatedSummary = aiSummary ? await translateContent(aiSummary, lang, false) : null;
              const translatedExcerpt = await translateContent(excerpt, lang, false);
              
              if (translatedTitle && translatedContent) {
                const langSlug = `${slug}-${lang}`;
                await supabase.from('articles').insert([{
                  title: translatedTitle,
                  slug: langSlug,
                  excerpt: translatedExcerpt || excerpt,
                  summary: translatedSummary || translatedExcerpt || excerpt,
                  ai_summary: translatedSummary,
                  content: translatedContent,
                  cover_image: coverImageUrl,
                  category: ronContent.category || 'Technology',
                  author_id: selectedAuthor.id,
                  author_name: selectedAuthor.name,
                  author_avatar: selectedAuthor.avatar,
                  published: true,
                  original_url: `${article.link}#${lang}`,
                  language: lang,
                  original_id: insertedData.id,
                  created_at: new Date().toISOString()
                }]);
                console.log(`      ✅ Published (${lang})`);
              }
            } catch (transError) {
              console.error(`      ⚠️ Translation failed for ${lang}:`, transError);
            }
          }
        }
      }

      // Rate limiting (wait 10s between articles to be nice to free APIs)
      await new Promise(r => setTimeout(r, 10000));

    } catch (error) {
      console.error(`   ❌ Pipeline Error for ${article.title}:`, error);
    }
  }

  // Run view count update
  console.log('📈 Updating view counts...');
  try {
    await backfillViews();
  } catch (err) {
    console.error('❌ Error updating view counts:', err);
  }

  console.log('💤 Pipeline finished. Sleeping...');
}

// Execution Logic
if (process.env.GITHUB_ACTIONS) {
  // CI Mode: Run once and exit
  console.log('🚀 Running in GitHub Actions mode');
  runPipeline()
    .then(() => {
      console.log('✅ Pipeline complete');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Pipeline failed', err);
      process.exit(1);
    });
} else {
  // Daemon Mode: Run immediately and schedule
  console.log('🔄 Running in Daemon mode (VPS/Local)');
  runPipeline();
  cron.schedule('*/30 * * * *', runPipeline);
}

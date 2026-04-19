
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import slugify from 'slugify';
import { rewriteContent } from './news-bot/llm';
import { generateImage } from './news-bot/image';

dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables.');
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

// SMART content formatter
function formatContent(rawContent: string): string {
  const hasHtmlStructure = /<(p|ul|ol|h2|blockquote)[^>]*>/i.test(rawContent);
  
  if (hasHtmlStructure) {
    let html = rawContent
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/<\/p>\s*<p/g, '</p>\n\n<p')
      .replace(/<\/p>\s*<h2/g, '</p>\n\n<h2')
      .replace(/<\/h2>\s*<p/g, '</h2>\n\n<p')
      .replace(/<\/ul>\s*<p/g, '</ul>\n\n<p')
      .replace(/<\/ol>\s*<p/g, '</ol>\n\n<p')
      .replace(/<\/p>\s*<ul/g, '</p>\n\n<ul')
      .replace(/<\/p>\s*<ol/g, '</p>\n\n<ol')
      .replace(/<\/blockquote>\s*<p/g, '</blockquote>\n\n<p')
      .replace(/<p>/g, '<p class="mb-8 leading-relaxed">')
      .replace(/<h2>/g, '<h2 class="text-2xl font-bold mt-12 mb-6">')
      .replace(/<ul>/g, '<ul class="my-8 space-y-3 list-disc pl-6">')
      .replace(/<ol>/g, '<ol class="my-8 space-y-3 list-decimal pl-6">')
      .replace(/<li>/g, '<li class="ml-2">')
      .replace(/<blockquote>/g, '<blockquote class="my-8 pl-6 border-l-4 border-brand-red italic">');
    
    return html;
  }
  
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
    line = markdownToHtml(line);
    
    const bulletMatch = line.match(/^[-•●◦▪]\s+(.+)$/) || line.match(/^(\d+)[.)]\s+(.+)$/);
    
    if (bulletMatch) {
      const bulletContent = bulletMatch[2] || bulletMatch[1];
      listItems.push(bulletContent);
      inList = true;
      continue;
    }
    
    if (inList && listItems.length > 0) {
      html += '\n\n<ul class="my-8 space-y-3 list-disc pl-6">\n';
      listItems.forEach(item => {
        html += `  <li class="ml-2">${markdownToHtml(item)}</li>\n`;
      });
      html += '</ul>\n\n';
      listItems = [];
      inList = false;
    }
    
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
  
  if (listItems.length > 0) {
    html += '\n\n<ul class="my-8 space-y-3 list-disc pl-6">\n';
    listItems.forEach(item => {
      html += `  <li class="ml-2">${markdownToHtml(item)}</li>\n`;
    });
    html += '</ul>\n\n';
  }
  
  return html.trim();
}

async function pushArticle() {
  const article = {
    title: "Bybit Pay’s Sri Lanka Launch Could Trigger South Asian Crypto Payment Revolution – Here’s Why",
    content: `Sri Lanka’s 130% mobile penetration and growing tourism make it an ideal testing ground for crypto-enabled commerce.

Amin Ayan
November 5, 2025 3 min read

Bybit Pay, the payment arm of the world’s second-largest crypto exchange, has launched in Sri Lanka amid rising interest in digital payments.

Key Takeaways:

Bybit Pay has launched in Sri Lanka with 100 merchant activations, marking a major step in expanding crypto payments across South Asia.
Sri Lanka’s 130% mobile penetration and growing tourism make it an ideal testing ground for crypto-enabled commerce.
The launch comes despite crypto’s unregulated status in Sri Lanka, highlighting rising interest in digital payment alternatives.


The rollout includes 100 merchant activations across the country, including 50 physical point-of-sale systems and 50 digital integrations, according to a recent announcement.

Partnering with Ceylon Cash through its CeyPay platform, Bybit Pay aims to connect Sri Lankan businesses to the growing global network of digital asset payments.

Sri Lanka’s Digital Boom Sets the Stage for Crypto Payments

Sri Lanka’s high mobile penetration rate of over 130% and rapid digital adoption make it a promising testing ground for crypto-enabled commerce.

With tourism rebounding and local demand rising for faster, cheaper payment methods, Bybit sees an opportunity to offer businesses a practical alternative to traditional financial rails.


“Sri Lanka’s combination of tech-forward consumers, substantial international tourism, and diverse merchant landscape creates ideal conditions for crypto payment adoption,” said Nazar Tymoshchuk, Regional Manager at Bybit.

“This rollout is part of Bybit Pay’s commitment to helping make payments painless, efficient, and borderless for as many people as possible.”

Bybit Pay’s platform allows merchants of any size to accept digital assets easily, with settlement options in either crypto or fiat.

Its main selling points include instant proof-of-payment, ultra-fast settlement, and lower transaction costs compared to legacy systems.

The company also promises strong fraud protection and compliance standards to boost merchant trust.

The launch comes as cryptocurrency is not legal tender or regulated in Sri Lanka.


According to directions No. 03 of 2021 under Foreign Exchange Act, No. 12 of 2017, Electronic Fund Transfer Cards (EFTCs) such as debit cards and credit cards are not to be used for payments related to cryptocurrency transactions.

Payments Companies Push into Crypto

In May, crypto payments platform Mesh unveiled its Apple Pay integration, which allows merchants partnered with Mesh to accept crypto payments via Apple Pay.

Mesh’s partnership with Apple Pay came as payments companies continue to expand into digital assets.

In April, global payments giant Stripe said it is developing a U.S. dollar-backed stablecoin aimed at companies operating outside the United States, United Kingdom, and Europe.

The announcement came after Stripe’s regulatory approval to acquire Bridge, a stablecoin payments network designed to rival traditional banking systems and SWIFT-based transfers.


Earlier this year, Jack Dorsey, former Twitter CEO and outspoken Bitcoin advocate, publicly urged Signal Messenger to integrate Bitcoin for peer-to-peer (P2P) payments.

Dorsey’s call was echoed by David Marcus, former president of PayPal and current CEO of Lightspark, who stated that “all non-transactional apps should connect to Bitcoin.”

The comments reflect a growing sentiment among Bitcoin advocates to reposition BTC not just as a store of value, but as a practical payment tool.

More recently, Singapore-based payments company Triple-A announced plans to integrate PayPal’s stablecoin into its list of supported tokens for customer payments.

Even companies like PayPal have entered the space, launching their own stablecoins and offering yield incentives to holders.`,
    link: "https://finance.yahoo.com/news/bybit-pay-sri-lanka-launch-111753298.html"
  };

  console.log(`\n✨ Processing Manual Article: ${article.title}`);

  try {
    // Rewrite Content
    console.log('   🧠 Rewriting with Crypto Ron...');
    const ronContent = await rewriteContent(article.title, article.content, article.link);
    
    if (!ronContent) {
      console.log('   ❌ Failed to rewrite content.');
      return;
    }

    // Generate Image
    console.log('   🎨 Generating Image...');
    let coverImageUrl = 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=1600';
    
    const imageBuffer = await generateImage(ronContent.image_prompt);
    
    if (imageBuffer) {
      const fileName = `ai-gen-${Date.now()}.webp`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(fileName, imageBuffer, {
          contentType: 'image/webp'
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('article-images')
          .getPublicUrl(fileName);
        coverImageUrl = publicUrlData.publicUrl;
        console.log('   ✅ AI Image uploaded successfully');
      } else {
        console.error('   ⚠️ Image upload failed, using default');
      }
    } else {
      console.log('   ⚠️ AI gen failed, using default');
    }

    // Publish to Supabase
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
    const formattedContent = formatContent(ronContent.content);
    const excerpt = ronContent.excerpt || ronContent.content.replace(/<[^>]*>/g, '').substring(0, 100);
    
    const { error: insertError } = await supabase
      .from('articles')
      .upsert([{
        title: ronContent.title,
        slug: slug,
        excerpt: excerpt,
        content: formattedContent,
        cover_image: coverImageUrl,
        category: ronContent.category || 'Technology',
        author_name: 'Crypto Ron',
        author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ron',
        published: true,
        original_url: article.link,
        created_at: new Date().toISOString()
      }], { onConflict: 'original_url' });

    if (insertError) {
      console.error('   ❌ Database Insert Error:', insertError);
    } else {
      console.log(`   🎉 Published (or Updated): ${ronContent.title}`);
    }

  } catch (error) {
    console.error(`   ❌ Error:`, error);
  }
}

pushArticle();

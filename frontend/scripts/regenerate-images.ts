
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { generateImagePrompt } from './news-bot/llm';
import { generateImage } from './news-bot/image';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function regenerateImages() {
  console.log('🔄 Starting image regeneration for recent articles...');

  // Fetch articles published before Jan 2nd, 2026 (covering "until Jan 1st")
  // Ordered from earliest to latest
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, content, slug, created_at')
    .eq('language', 'en')
    .lt('created_at', '2026-01-02T00:00:00Z')
    .order('created_at', { ascending: true });

  if (error || !articles) {
    console.error('❌ Error fetching articles:', error);
    return;
  }

  console.log(`Found ${articles.length} articles to process (Earliest to Jan 1st).`);

  let count = 0;
  for (const article of articles) {
    count++;
    console.log(`\n[${count}/${articles.length}] 🎨 Processing: ${article.title} (${new Date(article.created_at).toISOString().split('T')[0]})`);

    // Check if already regenerated
    const { data: currentArticle } = await supabase
      .from('articles')
      .select('cover_image')
      .eq('id', article.id)
      .single();
      
    if (currentArticle?.cover_image?.includes('ai-gen-regen')) {
      console.log('   ⏭️  Already regenerated. Skipping.');
      continue;
    }

    // Add delay to avoid rate limits (Base delay + random jitter)
    const delay = 15000 + Math.random() * 5000; // 15-20 seconds
    console.log(`   ⏳ Waiting ${Math.round(delay/1000)}s...`);
    await sleep(delay);


    // 1. Generate Prompt
    console.log('   💭 Generating new prompt...');
    const imagePrompt = await generateImagePrompt(article.title, article.content);
    console.log(`   📝 Prompt: ${imagePrompt.substring(0, 100)}...`);

    // 2. Generate Image
    console.log('   🎨 Generating image...');
    const imageBuffer = await generateImage(imagePrompt);

    if (!imageBuffer) {
      console.log('   ❌ Failed to generate image. Skipping.');
      continue;
    }
    console.log('   ✅ Image generated! Buffer size:', imageBuffer.length);

    // 3. Process & Upload
    let processedBuffer = imageBuffer;
    try {
      processedBuffer = await sharp(imageBuffer)
        .jpeg({ quality: 80, mozjpeg: true })
        .resize(1200, 675, { fit: 'cover' })
        .toBuffer();
    } catch (sharpError) {
      console.warn('   ⚠️ Sharp processing failed, using raw buffer:', sharpError);
    }

    try {
      const fileName = `ai-gen-regen-${Date.now()}-${article.slug.substring(0, 20)}.jpg`;


      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(fileName, processedBuffer, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('   ❌ Upload failed:', uploadError);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('article-images')
        .getPublicUrl(fileName);
      
      const newImageUrl = publicUrlData.publicUrl;
      console.log('   ✅ Image uploaded:', newImageUrl);

      // 4. Update Article (and translations)
      // Update the main article
      await supabase
        .from('articles')
        .update({ cover_image: newImageUrl })
        .eq('id', article.id);

      // Update translations (articles where original_id = article.id)
      await supabase
        .from('articles')
        .update({ cover_image: newImageUrl })
        .eq('original_id', article.id);

      console.log('   ✨ Database updated for article and translations.');

    } catch (err) {
      console.error('   💥 Error processing image:', err);
    }
  }

  console.log('\n✅ Regeneration complete!');
}

regenerateImages();

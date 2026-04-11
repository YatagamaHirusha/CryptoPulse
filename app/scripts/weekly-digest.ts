import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import slugify from 'slugify';
import { generateWeeklyDigest, generateImagePrompt } from './news-bot/llm';
import { generateImage } from './news-bot/image';
import sharp from 'sharp';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runWeeklyDigest() {
  console.log('🚀 Starting Weekly Digest Generation...');

  // 1. Fetch articles from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, summary, slug')
    .eq('published', true)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('view_count', { ascending: false }) // Prioritize popular articles
    .limit(10);

  if (error || !articles || articles.length === 0) {
    console.log('❌ No articles found for the week.');
    return;
  }

  console.log(`Found ${articles.length} articles for the digest.`);

  // 2. Generate Digest Content
  const digestInput = articles.map(a => ({
    title: a.title,
    summary: a.summary || a.title, // Fallback
    url: `https://web3instant.com/article/${a.id}` // Internal link
  }));

  const digest = await generateWeeklyDigest(digestInput);

  if (!digest) {
    console.log('❌ Failed to generate digest content.');
    return;
  }

  console.log(`📝 Generated Digest: ${digest.title}`);

  // 3. Generate Image
  let coverImageUrl = 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=1600';
  
  console.log('🎨 Generating Image...');
  const imagePrompt = await generateImagePrompt(digest.title, digest.content);
  const imageBuffer = await generateImage(imagePrompt);

  if (imageBuffer) {
    const processedBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 80, mozjpeg: true })
      .resize(1200, 675, { fit: 'cover' })
      .toBuffer();

    const fileName = `weekly-digest-${Date.now()}.jpg`;
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
    }
  }

  // 4. Publish Digest
  const slug = slugify(digest.title, { lower: true, strict: true });

  const { error: insertError } = await supabase
    .from('articles')
    .insert([{
      title: digest.title,
      slug: slug,
      excerpt: digest.excerpt,
      summary: digest.excerpt,
      content: digest.content,
      cover_image: coverImageUrl,
      category: 'Web3', // Or 'Newsletter'
      author_id: 'ec69d178-0b48-4268-ba81-f99420e53b2f',
      author_name: 'Web3Instant Weekly',
      author_avatar: 'https://web3instant.com/images/logo.png', // TODO: Update logo
      published: true,
      created_at: new Date().toISOString()
    }]);

  if (insertError) {
    console.error('❌ Failed to publish digest:', insertError);
  } else {
    console.log('🎉 Weekly Digest Published Successfully!');
  }
}

runWeeklyDigest();

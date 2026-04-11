
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Fix finding the .env.local file
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Using .env from:', envPath);
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImages() {
  console.log('Checking recent articles for image URLs...');
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, cover_image, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('No articles found.');
    return;
  }

  console.log(`Found ${articles.length} articles.`);
  articles.forEach((article, i) => {
    console.log(`\n[${i+1}] Article: ${article.title}`);
    console.log(`    Date: ${new Date(article.created_at).toLocaleString()}`);
    console.log(`    Image: ${article.cover_image}`);
    
    // Basic validation
    if (!article.cover_image) {
      console.log('    ❌ Missing image URL');
    } else if (article.cover_image.startsWith('http')) {
      try {
        const url = new URL(article.cover_image);
        console.log(`    ✅ Valid URL format. Domain: ${url.hostname}`);
      } catch (e) {
        console.log('    ❌ Invalid URL format');
      }
    } else {
      console.log('    ⚠️ Relative or unknown format');
    }
  });
}

checkImages();

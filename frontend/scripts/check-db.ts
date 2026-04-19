import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkDatabase() {
  // Count all articles
  const { count: totalCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Total articles in database: ${totalCount}`);

  // Get latest 5 articles
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, created_at, original_url, published')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📰 Latest articles:');
  articles?.forEach((article, i) => {
    console.log(`${i + 1}. ${article.title.substring(0, 60)}...`);
    console.log(`   Created: ${new Date(article.created_at).toLocaleString()}`);
    console.log(`   Published: ${article.published ? 'Yes' : 'No'}`);
    console.log(`   URL: ${article.original_url || 'None'}`);
    console.log('');
  });
}

checkDatabase();

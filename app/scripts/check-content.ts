import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkContent() {
  const { data } = await supabase
    .from('articles')
    .select('title, content')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  console.log('Title:', data?.title);
  console.log('\n--- CONTENT ---\n');
  console.log(data?.content);
}

checkContent();

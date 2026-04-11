
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { translateContent } from './llm';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfill() {
  console.log('Starting backfill...');
  
  // Fetch latest 10 English articles to test
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .eq('language', 'en')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !articles) {
    console.error('Error fetching articles:', error);
    return;
  }

  console.log(`Found ${articles.length} English articles to check.`);

  const LANGUAGES = ['es', 'fr', 'ar'];

  for (const article of articles) {
    console.log(`Checking translations for: ${article.title}`);

    for (const lang of LANGUAGES) {
      // Check if translation exists
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('original_id', article.id)
        .eq('language', lang)
        .single();

      if (existing) {
        console.log(`  - ${lang} exists.`);
        continue;
      }

      console.log(`  - Translating to ${lang}...`);
      
      try {
        const translatedTitle = await translateContent(article.title, lang, false);
        const translatedContent = await translateContent(article.content, lang, true);
        const translatedSummary = article.ai_summary ? await translateContent(article.ai_summary, lang, false) : null;
        const translatedExcerpt = await translateContent(article.excerpt || '', lang, false);

        if (translatedTitle && translatedContent) {
          const langSlug = `${article.slug}-${lang}`;
          
          const { error: insertError } = await supabase.from('articles').insert([{
            title: translatedTitle,
            slug: langSlug,
            excerpt: translatedExcerpt || article.excerpt,
            summary: translatedSummary || translatedExcerpt || article.summary,
            ai_summary: translatedSummary,
            content: translatedContent,
            cover_image: article.cover_image,
            category: article.category,
            author_id: article.author_id,
            author_name: article.author_name,
            author_avatar: article.author_avatar,
            published: true,
            original_url: article.original_url ? `${article.original_url}#${lang}` : null,
            language: lang,
            original_id: article.id,
            created_at: article.created_at // Keep original date
          }]);

          if (insertError) {
            console.error(`    ❌ Insert failed for ${lang}:`, insertError.message);
          } else {
            console.log(`    ✅ Published (${lang})`);
          }
        } else {
            console.log(`    ⚠️ Translation returned empty for ${lang}`);
        }
        
        // Rate limit
        await new Promise(r => setTimeout(r, 2000));

      } catch (err) {
        console.error(`    ❌ Error translating ${lang}:`, err);
      }
    }
  }
  console.log('Backfill complete.');
}

backfill();

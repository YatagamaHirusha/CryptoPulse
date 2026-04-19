
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import slugify from 'slugify';
import readline from 'readline';
import { rewriteContent, selectAuthorForCategory } from './news-bot/llm';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

// Helper to format content (simplified version of push-article.ts)
function formatContent(rawContent: string): string {
  // If it already looks like HTML, just do some cleanup
  if (/<(p|div|section)/.test(rawContent)) {
      return rawContent
        .replace(/<p>/g, '<p class="mb-8 leading-relaxed">')
        .replace(/<h2>/g, '<h2 class="text-3xl font-bold mt-12 mb-6">')
        .replace(/<ul>/g, '<ul class="list-disc pl-6 mb-8 space-y-4">')
        .replace(/<ol>/g, '<ol class="list-decimal pl-6 mb-8 space-y-4">')
        .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-blue-500 pl-6 py-2 my-8 italic bg-gray-50 dark:bg-gray-900 rounded-r-lg">');
  }

  // Otherwise treat as Markdown-ish text
  return rawContent
    .split('\n\n')
    .map(para => {
      para = para.trim();
      if (!para) return '';
      if (para.startsWith('# ')) return `<h1 class="text-4xl font-bold mb-8">${para.substring(2)}</h1>`;
      if (para.startsWith('## ')) return `<h2 class="text-3xl font-bold mt-12 mb-6">${para.substring(3)}</h2>`;
      if (para.startsWith('- ')) return `<ul class="list-disc pl-6 mb-8 space-y-4">${para.split('\n').map(item => `<li>${item.substring(2)}</li>`).join('')}</ul>`;
      return `<p class="mb-8 leading-relaxed">${para}</p>`;
    })
    .join('\n');
}

async function main() {
  console.log('📝 Manual Article Publisher');
  console.log('---------------------------');

  try {
    const title = await askQuestion('Article Title: ');
    const category = await askQuestion('Category (Crypto, Bitcoin, DeFi, Regulation, etc.): ');
    const originalUrl = await askQuestion('Original URL (optional): ');
    const originalImageUrl = await askQuestion('Original Image URL (optional): ');
    
    console.log('\nPaste the article content below. Type "END" on a new line when finished:');
    
    let content = '';
    for await (const line of rl) {
        if (line.trim() === 'END') break;
        content += line + '\n';
    }

    if (!content.trim()) {
        console.error('❌ Error: Content cannot be empty.');
        process.exit(1);
    }

    console.log('\n🤖 Generating AI Rewrite...');
    
    const author = selectAuthorForCategory(category);
    console.log(`   Selected Author: ${author.name}`);

    // Call LLM reuse logic
    const { 
        title: newTitle, 
        content: newContent, 
        excerpt: newExcerpt 
    } = await rewriteContent(
        title, 
        content, 
        originalUrl || undefined, 
        originalImageUrl ? [originalImageUrl] : [], 
        author
    );

    console.log('✅ Rewrite Complete!');
    console.log(`   New Title: ${newTitle}`);

    // Generate slug
    let slug = slugify(newTitle, { lower: true, strict: true });
    // Check for collision
    const { data: existing } = await supabase.from('articles').select('slug').eq('slug', slug).single();
    if (existing) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    // Prepare DB object
    // Note: Skipping AI image generation as keys might be missing, using original or default
    const finalImage = originalImageUrl || 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=1000';

    const articleData = {
        title: newTitle,
        slug,
        content: formatContent(newContent),
        excerpt: newExcerpt,
        category,
        author_name: author.name,
        author_avatar: author.avatar,
        cover_image: finalImage,
        published: true,
        featured: false,
        created_at: new Date().toISOString(),
        // updated_at omitted as it may not exist in some DB instances
        // updated_at: new Date().toISOString(),
        view_count: 0
    };

    console.log('💾 Saving to Supabase...');
    
    const { error: saveError } = await supabase
        .from('articles')
        .insert(articleData);

    if (saveError) {
        throw new Error(`Supabase Error: ${saveError.message}`);
    }

    console.log(`🎉 Article published successfully!`);
    console.log(`   Slug: ${slug}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main();

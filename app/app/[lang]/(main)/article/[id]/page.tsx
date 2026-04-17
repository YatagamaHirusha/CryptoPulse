import { Metadata } from 'next'
import { supabase } from '../../../../lib/supabase'
import { publishedArticlesFrom, type ArticleRow } from '../../../../lib/articleQueries'
import { getDisplayViews } from '../../../../lib/viewUtils'
import ArticleClient from './ArticleClient'

// Generate Metadata
export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }): Promise<Metadata> {
  const { lang, id } = await params
  
  // Try fetching by ID first (legacy support)
  let { data: article } = await supabase.from('articles').select('*').eq('id', id).single()
  
  // If not found by ID, try fetching by slug
  if (!article) {
    const { data: articleBySlug } = await supabase.from('articles').select('*').eq('slug', id).single()
    article = articleBySlug
  }

  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.cover_image],
      type: 'article',
      publishedTime: article.created_at,
      authors: [article.author_name || 'Crypto Ron'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.cover_image],
    },
    alternates: {
      canonical: `/${lang}/article/${article.slug || article.id}`,
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params
  
  // 1. Try fetching by ID first (legacy support)
  let { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  // 2. If not found by ID, try fetching by slug
  if (!article) {
    const { data: articleBySlug } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', id)
      .single()
    article = articleBySlug
  }
  
  if (article) {
    const articleLang = article.language ?? "en";
    if (articleLang !== lang) {
       // 4. Mismatch. We need to find the version in 'lang'.
       
       // Case A: The fetched article is the "original" (e.g. English), and we want a translation.
       // Look for an article where original_id = article.id AND language = lang.
       const { data: translation } = await supabase
          .from('articles')
          .select('*')
          .eq('original_id', article.id)
          .eq('language', lang)
          .single();
          
       if (translation) {
          article = translation;
       } else {
          // Case B: The fetched article is a translation, and we want another language.
          if (article.original_id) {
              if (lang === 'en') { // Assuming 'en' is the original language
                   // Fetch the parent
                   const { data: parent } = await supabase
                      .from('articles')
                      .select('*')
                      .eq('id', article.original_id)
                      .single();
                   if (parent) article = parent;
              } else {
                   // Fetch sibling translation
                   const { data: sibling } = await supabase
                      .from('articles')
                      .select('*')
                      .eq('original_id', article.original_id)
                      .eq('language', lang)
                      .single();
                   if (sibling) article = sibling;
              }
          }
       }
       // If no translation found, we fall back to the original 'article' we fetched.
    }
  }
  
  if (!article) {
    return <ArticleClient article={null} relatedArticles={[]} featuredArticles={[]} />
  }

  // Format article data
  const formattedArticle = {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    summary: article.summary,
    ai_summary: article.ai_summary, // Pass AI Quick Read
    content: article.content,
    cover_image: article.cover_image || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1600',
    created_at: article.created_at,
    author: { 
      name: article.author_name || 'Crypto Ron', 
      avatar: article.author_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ron',
      role: article.author_role
    },
    category: article.category,
    view_count: getDisplayViews(article.created_at, article.view_count)
  }

  const { data: related } = await publishedArticlesFrom(supabase, lang, "*")
    .eq("category", article.category)
    .neq("id", article.id)
    .order("created_at", { ascending: false })
    .limit(4)

  const formattedRelated = (related || []).map((a: ArticleRow) => ({
    id: a.slug || a.id,
    title: a.title,
    excerpt: a.excerpt,
    cover_image: a.cover_image || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1600',
    created_at: a.created_at,
    category: a.category
  }))

  const { data: featured } = await publishedArticlesFrom(supabase, lang, "*")
    .neq("id", article.id)
    .order("created_at", { ascending: false })
    .limit(4)

  const formattedFeatured = (featured || []).map((a: ArticleRow) => ({
    id: a.slug || a.id,
    title: a.title,
    cover_image: a.cover_image || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1600',
    created_at: a.created_at,
    category: a.category
  }))
  
  return <ArticleClient article={formattedArticle} relatedArticles={formattedRelated} featuredArticles={formattedFeatured} lang={lang} />
}

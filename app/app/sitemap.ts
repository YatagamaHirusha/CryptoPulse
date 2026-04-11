import { MetadataRoute } from 'next'
import { supabase } from './lib/supabase'

const languages = ['en', 'es', 'fr', 'ar'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.web3instant.com'

  // Fetch all published articles
  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, updated_at, title, cover_image')
    .eq('published', true)
    .order('updated_at', { ascending: false })

  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const lang of languages) {
    // Static pages
    sitemapEntries.push(
      {
        url: `${baseUrl}/${lang}`,
        lastModified: new Date(),
        changeFrequency: 'always',
        priority: 1,
      },
      {
        url: `${baseUrl}/${lang}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/${lang}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/${lang}/latest-news`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.9,
      }
    );

    // Articles
    if (articles) {
      articles.forEach(article => {
        sitemapEntries.push({
          url: `${baseUrl}/${lang}/article/${article.slug || article.id}`,
          lastModified: new Date(article.updated_at),
          changeFrequency: 'daily' as const,
          priority: 0.7,
          images: article.cover_image ? [article.cover_image] : undefined,
        });
      });
    }
  }

  return sitemapEntries;
}

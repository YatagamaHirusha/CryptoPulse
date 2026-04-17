import { supabase } from '../../lib/supabase';
import { publishedArticlesFrom, type ArticleRow } from '../../lib/articleQueries';
import type { Article } from '../../components/ArticleCard';
import { getDisplayViews } from '../../lib/viewUtils';
import ArticleCard from '../../components/ArticleCard';
import Pagination from '../../components/Pagination';
import Link from 'next/link';
import { TRANSLATIONS } from '../../lib/translations';
import { Metadata } from 'next';

export const revalidate = 0;

const ARTICLES_PER_PAGE = 9;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: 'Top Crypto Stories & Hot Topics | Web3Instant',
    description: 'Discover the most popular and trending crypto news stories. Read about hot topics in the blockchain and web3 world.',
    alternates: {
      canonical: `/${lang}/top-stories`,
    },
  };
}

export default async function TopStoriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { lang } = await params;
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  const search = await searchParams;
  const currentPage = Number(search.page) || 1;
  const offset = (currentPage - 1) * ARTICLES_PER_PAGE;

  const { count } = await publishedArticlesFrom(supabase, lang, "*", {
    count: "exact",
    head: true,
  })
    .eq("featured", true);

  const totalPages = Math.ceil((count || 0) / ARTICLES_PER_PAGE);

  const { data: articles } = await publishedArticlesFrom(supabase, lang, "*")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + ARTICLES_PER_PAGE - 1);

  const formattedArticles: Article[] =
    (articles?.map((article: ArticleRow) => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || '',
      cover_image: article.cover_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1600',
      created_at: article.created_at,
      author: {
        name: article.author_name || 'Unknown Author',
        avatar: article.author_avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=100'
      },
      category: article.category || "News",
      slug: article.slug ?? undefined,
      likes_count: article.likes_count || 0,
      views_count: getDisplayViews(article.created_at, article.view_count)
    })) ?? []);

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 border-b border-slate-200 dark:border-zinc-800 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Top Stories
              </h1>
              <p className="text-slate-600 dark:text-zinc-400">
                Curated selection of the most important news and updates.
              </p>
            </div>
            <Link 
              href={`/${lang}`}
              className="hidden md:inline-flex text-brand-red hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors"
            >
              {t.latestNews.backToHome}
            </Link>
          </div>
        </div>

        {/* Articles Grid */}
        {formattedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {formattedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} lang={lang} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-slate-400 dark:text-zinc-500 text-lg">
              No top stories found at the moment. Check out our <Link href={`/${lang}/latest-news`} className="text-brand-red hover:underline">latest news</Link>.
            </div>
          </div>
        )}

        {/* Pagination */}
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          baseUrl={`/${lang}/top-stories`} 
        />
      </div>
    </main>
  );
}

import { supabase } from '../../../lib/supabase';
import { getDisplayViews } from '../../../lib/viewUtils';
import ArticleCard from '../../../components/ArticleCard';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 0;

const ARTICLES_PER_PAGE = 6;

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { lang } = await params;
  const search = await searchParams;
  const query = search.q || '';
  const currentPage = Number(search.page) || 1;
  const offset = (currentPage - 1) * ARTICLES_PER_PAGE;

  // If no query, return empty state or latest news
  if (!query) {
    return (
      <main className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Search News
            </h1>
            <p className="text-slate-600 dark:text-zinc-400">
              Please enter a search term to find articles.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Get total count for search query
  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('published', true)
    .eq('language', lang)
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`);

  const totalPages = Math.ceil((count || 0) / ARTICLES_PER_PAGE);

  // Get articles for current page
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('published', true)
    .eq('language', lang)
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .range(offset, offset + ARTICLES_PER_PAGE - 1);

  // Get featured articles (sidebar)
  const { data: featuredArticles } = await supabase
    .from('articles')
    .select('*')
    .eq('published', true)
    .eq('language', lang)
    .order('created_at', { ascending: false })
    .limit(5);

  const formattedArticles = articles?.map(article => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt || '',
    cover_image: article.cover_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1600',
    created_at: article.created_at,
    author: {
      name: article.author_name || 'Unknown Author',
      avatar: article.author_avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=100'
    },
    category: article.category,
    slug: article.slug,
    likes_count: article.likes_count || 0,
    views_count: getDisplayViews(article.created_at, article.view_count)
  })) || [];

  const formattedFeatured = featuredArticles?.map(article => ({
    id: article.id,
    title: article.title,
    cover_image: article.cover_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1600',
    created_at: article.created_at,
    category: article.category,
    slug: article.slug,
  })) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 border-b border-slate-200 dark:border-zinc-800 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-brand-red"></div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                  Search Results
                </h1>
              </div>
              <p className="text-slate-600 dark:text-zinc-400 ml-4">
                Showing results for "{query}"
              </p>
            </div>
            <Link 
              href={`/${lang}`}
              className="hidden md:inline-flex text-brand-red hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Articles Grid - Main Column */}
          <div className="flex-1">
            {formattedArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {formattedArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} lang={lang} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-slate-400 dark:text-zinc-500 text-lg">
                  No articles found matching "{query}".
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {/* Previous Button */}
                {currentPage > 1 ? (
                  <Link
                    href={`/${lang}/search?q=${query}&page=${currentPage - 1}`}
                    className="px-4 py-2 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors font-medium"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed font-medium"
                  >
                    ← Previous
                  </button>
                )}

                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                    const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

                    if (!showPage && !showEllipsisBefore && !showEllipsisAfter) {
                      return null;
                    }

                    if (showEllipsisBefore || showEllipsisAfter) {
                      return (
                        <span
                          key={`ellipsis-${page}`}
                          className="px-2 text-slate-500 dark:text-zinc-400"
                        >
                          ...
                        </span>
                      );
                    }

                    return (
                      <Link
                        key={page}
                        href={`/${lang}/search?q=${query}&page=${page}`}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-brand-red text-white'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {page}
                      </Link>
                    );
                  })}
                </div>

                {/* Next Button */}
                {currentPage < totalPages ? (
                  <Link
                    href={`/search?q=${query}&page=${currentPage + 1}`}
                    className="px-4 py-2 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors font-medium"
                  >
                    Next →
                  </Link>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed font-medium"
                  >
                    Next →
                  </button>
                )}
              </div>
            )}

            {/* Page Info */}
            {formattedArticles.length > 0 && (
              <div className="mt-6 text-center">
                <p className="text-slate-500 dark:text-zinc-400 text-sm">
                  Showing {offset + 1}-{offset + formattedArticles.length} of {count} articles
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Featured News */}
          <aside className="lg:w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-32">
              <div className="bg-slate-50 dark:bg-zinc-900 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-brand-red"></div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Featured News
                  </h2>
                </div>

                {formattedFeatured.length > 0 ? (
                  <div className="space-y-4">
                    {formattedFeatured.map((article, index) => (
                      <Link
                        key={article.id}
                        href={`/${lang}/article/${article.slug || article.id}`}
                        className="group block"
                      >
                        <div className="flex gap-4">
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                            <img
                              src={article.cover_image}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-brand-red uppercase tracking-wide">
                              {article.category}
                            </span>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-brand-red transition-colors mt-1">
                              {article.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                              {formatDate(article.created_at)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-zinc-500 text-sm">
                    No featured articles yet.
                  </p>
                )}

                {/* View All Link */}
                <Link
                  href={`/${lang}/latest-news`}
                  className="block mt-6 text-center text-sm font-medium text-brand-red hover:text-red-700 dark:hover:text-red-400 transition-colors"
                >
                  View All News →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

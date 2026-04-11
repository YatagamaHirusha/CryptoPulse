import { supabase } from '../../../lib/supabase';
import { getDisplayViews } from '../../../lib/viewUtils';
import ArticleCard from '../../../components/ArticleCard';
import Pagination from '../../../components/Pagination';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const revalidate = 0;

const ARTICLES_PER_PAGE = 6;

// Valid categories (lowercase for URL matching)
const VALID_CATEGORIES = [
  'bitcoin',
  'ethereum',
  'defi',
  'nfts',
  'technology',
  'business',
  'finance',
  'politics',
  'culture',
  'pr',
  'gaming',
  'metaverse',
  'regulation',
  'tech',
  'travel'
];

// Map URL slugs to display names
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum',
  defi: 'DeFi',
  nfts: 'NFTs',
  technology: 'Technology',
  business: 'Business',
  finance: 'Finance',
  politics: 'Politics',
  culture: 'Culture',
  pr: 'PR',
  gaming: 'Gaming',
  metaverse: 'Metaverse',
  regulation: 'Regulation',
  tech: 'Technology',
  travel: 'Travel'
};

// Map URL slugs to Database Category values (for querying)
const DB_CATEGORY_MAPPING: Record<string, string> = {
  'gaming': 'Web3 Gaming',
  'tech': 'Technology'
};

// Category descriptions
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  bitcoin: 'Latest Bitcoin news, price analysis, and market updates',
  ethereum: 'Ethereum ecosystem news, DeFi updates, and smart contract developments',
  defi: 'Decentralized finance news, yield farming, and protocol updates',
  nfts: 'NFT drops, digital art, and collectibles news',
  technology: 'Blockchain technology, innovations, and technical developments',
  business: 'Crypto business news, partnerships, and corporate adoption',
  finance: 'Cryptocurrency markets, trading, and financial analysis',
  politics: 'Crypto regulation, policy, and government news',
  culture: 'Web3 culture, community, and lifestyle',
  pr: 'Press releases and official announcements from crypto projects and companies',
  gaming: 'The latest in blockchain gaming, play-to-earn, and GameFi',
  metaverse: 'News from the virtual worlds, digital land, and metaverse platforms',
  regulation: 'Global crypto regulatory updates, laws, and compliance news',
  tech: 'Blockchain technology, innovations, and technical developments',
  travel: 'Crypto travel news, digital nomad lifestyle, and crypto-friendly destinations'
};

import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ lang: string; category: string }> }): Promise<Metadata> {
  const { lang, category } = await params;
  const categoryLower = category.toLowerCase();
  
  const displayName = CATEGORY_DISPLAY_NAMES[categoryLower] || category.charAt(0).toUpperCase() + category.slice(1);
  const description = CATEGORY_DESCRIPTIONS[categoryLower] || `Latest ${displayName} news and updates`;

  return {
    title: `${displayName} News`,
    description: description,
    openGraph: {
      title: `${displayName} News | Web3Instant`,
      description: description,
    },
    twitter: {
      title: `${displayName} News | Web3Instant`,
      description: description,
    },
    alternates: {
      canonical: `/${lang}/${category}`,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { lang, category } = await params;
  const search = await searchParams;
  
  // Check if valid category
  const categoryLower = category.toLowerCase();
  if (!VALID_CATEGORIES.includes(categoryLower)) {
    notFound();
  }

  const displayName = CATEGORY_DISPLAY_NAMES[categoryLower] || category;
  const description = CATEGORY_DESCRIPTIONS[categoryLower] || `Latest ${displayName} news and updates`;
  
  // Determine the category value to query in DB
  // Use mapping if exists, otherwise use the display name (which usually matches DB convention like 'Bitcoin')
  // or just use the categoryLower if no mapping (but DB usually has Capitalized)
  // Actually, let's use the mapping or fall back to categoryLower. 
  // But wait, 'bitcoin' in URL -> 'Bitcoin' in Display. DB likely has 'Bitcoin' or 'bitcoin'.
  // The previous code used `ilike('category', categoryLower)`.
  // `ilike` is case insensitive, so 'bitcoin' matches 'Bitcoin'.
  // But 'gaming' does NOT match 'Web3 Gaming'.
  const dbCategoryQuery = DB_CATEGORY_MAPPING[categoryLower] || categoryLower.replace(/-/g, ' ');

  const currentPage = Number(search.page) || 1;
  const offset = (currentPage - 1) * ARTICLES_PER_PAGE;

  // Get total count for this category
  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('published', true)
    .eq('language', lang) // Filter by language
    .ilike('category', dbCategoryQuery);

  const totalPages = Math.ceil((count || 0) / ARTICLES_PER_PAGE);

  // Get articles for current page (filtered by category)
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('published', true)
    .eq('language', lang) // Filter by language
    .ilike('category', dbCategoryQuery)
    .order('created_at', { ascending: false })
    .range(offset, offset + ARTICLES_PER_PAGE - 1);

  // Get featured articles (from any category, most recent)
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
                  {displayName}
                </h1>
              </div>
              <p className="text-slate-600 dark:text-zinc-400 ml-4">
                {description}
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
                  No {displayName} articles found. Check back soon!
                </div>
              </div>
            )}

            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              baseUrl={`/${lang}/${categoryLower}`} 
            />

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

              {/* Categories Quick Links */}
              <div className="mt-6 bg-slate-50 dark:bg-zinc-900 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-brand-red"></div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Categories
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {VALID_CATEGORIES.filter(cat => cat !== categoryLower).map(cat => (
                    <Link
                      key={cat}
                      href={`/${lang}/${cat}`}
                      className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-full hover:bg-brand-red hover:text-white transition-colors"
                    >
                      {CATEGORY_DISPLAY_NAMES[cat]}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

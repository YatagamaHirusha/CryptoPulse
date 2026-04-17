import { supabase } from '../../../../lib/supabase';
import { filterArticlesByLocale, type ArticleRow } from '../../../../lib/articleQueries';
import type { Article } from '../../../../components/ArticleCard';
import { getDisplayViews } from '../../../../lib/viewUtils';
import { TRANSLATIONS } from '../../../../lib/translations';
import ArticleCard from '../../../../components/ArticleCard';
import Pagination from '../../../../components/Pagination';
import { Mail, Twitter, Linkedin, Globe } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 0;

const ARTICLES_PER_PAGE = 9;

interface Props {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
  searchParams: Promise<{ page?: string }>;
}

async function getProfile(slug: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
}

async function getAuthorArticles(authorId: string, lang: string, page: number = 1) {
  const offset = (page - 1) * ARTICLES_PER_PAGE;
  
  const base = supabase
    .from("articles")
    .select("*", { count: "exact" })
    .eq("author_id", authorId)
    .eq("published", true);
  const { data, count, error } = await filterArticlesByLocale(base, lang)
    .order("created_at", { ascending: false })
    .range(offset, offset + ARTICLES_PER_PAGE - 1);

  if (error) return { data: [], count: 0 };
  return { data: data || [], count: count || 0 };
}

async function getOtherAuthors(currentAuthorId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, slug')
    .neq('id', currentAuthorId)
    .limit(5);
    
  return data || [];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const profile = await getProfile(slug);
  if (!profile) return { title: 'Author Not Found' };
  
  return {
    title: `${profile.full_name} - Author Profile`,
    description: profile.bio || `Read articles by ${profile.full_name}`,
  };
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const { lang, slug } = await params;
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  const search = await searchParams;
  const currentPage = Number(search.page) || 1;
  
  const profile = await getProfile(slug);
  
  if (!profile) {
    notFound();
  }

  const { data: articles, count } = await getAuthorArticles(profile.id, lang, currentPage);
  const otherAuthors = await getOtherAuthors(profile.id);
  const totalPages = Math.ceil(count / ARTICLES_PER_PAGE);

  // Format articles for ArticleCard
  const formattedArticles: Article[] = articles.map((article: ArticleRow) => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt || '',
    cover_image: article.cover_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1600',
    created_at: article.created_at,
    author: {
      name: profile.full_name,
      avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
    },
    likes_count: 0, // Placeholder
    views_count: getDisplayViews(article.created_at, article.view_count),
    category: article.category || "News",
    slug: article.slug ?? undefined,
  }));

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Breadcrumb / Header */}
        <div className="flex items-center mb-12">
          <div className="w-1 h-6 bg-brand-red mr-3 flex-shrink-0"></div>
          <h1 className="text-xl font-sans font-medium text-black dark:text-white flex-shrink-0 mr-4">
            {t.author.meetAuthor}
          </h1>
          <div className="flex-grow h-px bg-slate-200 dark:bg-zinc-800"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Sidebar - Author Info */}
          <div className="lg:col-span-3 space-y-8">
            <div className="text-center lg:text-left">
              <div className="relative inline-block">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-lg mx-auto lg:mx-0">
                  <img 
                    src={profile.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400'} 
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <h2 className="mt-6 text-3xl font-bold text-slate-900 dark:text-white font-heading">
                {profile.full_name}
              </h2>
              
              {profile.role && (
                <p className="mt-2 text-brand-red font-medium">
                  {profile.role}
                </p>
              )}
            </div>

            <div className="prose dark:prose-invert text-slate-600 dark:text-zinc-400">
              <p className="whitespace-pre-wrap">{profile.bio || t.author.noBio}</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
              <h3 className="font-bold text-slate-900 dark:text-white">{t.author.contact}</h3>
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center space-x-2 text-slate-600 dark:text-zinc-400 hover:text-brand-red transition-colors">
                  <Mail size={18} />
                  <span>{profile.email}</span>
                </a>
              )}
              
              <div className="flex items-center space-x-4 pt-2">
                {profile.twitter_url && (
                  <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full text-slate-600 dark:text-zinc-400 hover:bg-brand-red hover:text-white transition-colors">
                    <Twitter size={18} />
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full text-slate-600 dark:text-zinc-400 hover:bg-brand-red hover:text-white transition-colors">
                    <Linkedin size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* Other Authors */}
            {otherAuthors.length > 0 && (
              <div className="pt-8 border-t border-slate-200 dark:border-zinc-800">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-6 bg-brand-red mr-3 flex-shrink-0"></div>
                  <h3 className="text-lg font-sans font-medium text-black dark:text-white flex-shrink-0">
                    {t.author.otherAuthors}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {otherAuthors.map((author: any) => (
                    <Link 
                      key={author.slug || author.full_name} 
                      href={`/${lang}/authors/${author.slug}`}
                      className="block w-12 h-12 rounded-full overflow-hidden border-2 border-transparent hover:border-brand-red transition-colors"
                      title={author.full_name}
                    >
                      <img 
                        src={author.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
                        alt={author.full_name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Content - Articles */}
          <div className="lg:col-span-9">
            <div className="flex items-center mb-8">
              <div className="w-1 h-6 bg-brand-red mr-3 flex-shrink-0"></div>
              <h2 className="text-xl font-sans font-medium text-black dark:text-white flex-shrink-0 mr-4">
                {t.author.latestArticles} {profile.full_name.split(' ')[0]}
              </h2>
              <div className="flex-grow h-px bg-slate-200 dark:bg-zinc-800"></div>
            </div>

            {formattedArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {formattedArticles.map((article) => (
                  <div key={article.id} className="h-full">
                    <ArticleCard article={article} lang={lang} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-slate-600 dark:text-zinc-400">{t.author.noArticles}</p>
              </div>
            )}

            {/* Pagination */}
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              baseUrl={`/${lang}/authors/${slug}`} 
            />
          </div>

        </div>
      </div>
    </div>
  );
}

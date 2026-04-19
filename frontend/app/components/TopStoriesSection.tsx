import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatTimeAgo } from '../lib/dateUtils';

interface Article {
  id: string;
  slug?: string;
  title: string;
  excerpt: string;
  cover_image: string;
  created_at: string;
  author: {
    name: string;
    avatar: string;
    role?: string;
  };
  category: string;
}

export default function TopStoriesSection({ 
  title,
  mainArticle, 
  listArticles,
  viewAllLink,
  lang = 'en'
}: { 
  title: string;
  mainArticle: Article; 
  listArticles: Article[]; 
  viewAllLink?: string;
  lang?: string;
}) {
  return (
    <section className="mb-16 bg-slate-50 dark:bg-zinc-900 p-8 rounded-2xl transition-colors duration-300">
      {/* Section Header */}
      <div className="flex items-center mb-8">
        <div className="w-1 h-6 bg-brand-red mr-3 flex-shrink-0"></div>
        <h2 className="text-xl font-sans font-medium text-black dark:text-white flex-shrink-0 mr-4">
          {title}
        </h2>
        <div className="flex-grow h-px bg-slate-200 dark:bg-zinc-800"></div>
        {viewAllLink && (
          <Link 
            href={viewAllLink} 
            className="flex items-center text-sm text-slate-500 dark:text-zinc-400 hover:text-brand-red dark:hover:text-brand-red transition-colors flex-shrink-0 ml-4"
          >
            View All <ArrowRight size={14} className="ml-1" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Main Article (Image Overlay) */}
        <div className="lg:col-span-7">
          <Link href={`/${lang}/article/${mainArticle.slug || mainArticle.id}`} className="group block h-full relative rounded-xl overflow-hidden min-h-[400px]">
            <img
              src={mainArticle.cover_image}
              alt={mainArticle.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
                  {mainArticle.category}
                </span>
                {mainArticle.author.role && (
                  <span className="text-xs text-white/70 border-l border-white/30 pl-3">
                    By {mainArticle.author.name}, {mainArticle.author.role}
                  </span>
                )}
              </div>
              <h3 className="text-2xl md:text-3xl font-sans font-bold text-white leading-tight mb-2 group-hover:underline decoration-1 underline-offset-4 transition-all">
                {mainArticle.title}
              </h3>
            </div>
          </Link>
        </div>

        {/* Right Column: List Articles */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-8">
            {listArticles.map((article) => (
              <Link key={article.id} href={`/${lang}/article/${article.slug || article.id}`} className="block group">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                    {article.category} • {formatTimeAgo(article.created_at, lang)}
                  </span>
                </div>
                <h4 className="text-lg font-medium text-black dark:text-zinc-100 leading-snug group-hover:underline decoration-1 underline-offset-4 transition-all">
                  {article.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

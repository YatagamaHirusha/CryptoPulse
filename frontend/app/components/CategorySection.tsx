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

export default function CategorySection({ 
  title, 
  articles, 
  viewAllLink,
  columns = 4,
  lang = 'en'
}: { 
  title: string; 
  articles: Article[]; 
  viewAllLink: string;
  columns?: 3 | 4;
  lang?: string;
}) {
  if (!articles || articles.length === 0) return null;

  const gridCols = columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="flex items-center mb-8">
        <div className="w-1 h-6 bg-brand-red mr-3 flex-shrink-0"></div>
        <h2 className="text-xl font-sans font-medium text-black dark:text-white flex-shrink-0 mr-4">
          {title}
        </h2>
        <div className="flex-grow h-px bg-slate-200 dark:bg-zinc-800"></div>
        <Link 
          href={viewAllLink} 
          className="flex items-center text-sm text-slate-500 dark:text-zinc-400 hover:text-brand-red dark:hover:text-brand-red transition-colors flex-shrink-0 ml-4"
        >
          View All <ArrowRight size={14} className="ml-1" />
        </Link>
      </div>

      {/* Articles Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-6`}>
        {articles.map((article) => (
          <Link key={article.id} href={`/${lang}/article/${article.slug || article.id}`} className="group flex flex-row md:block gap-4 md:gap-0">
            <div className="relative w-24 h-24 md:w-full md:h-auto md:aspect-[3/2] flex-shrink-0 rounded-lg overflow-hidden mb-0 md:mb-4">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 hidden md:block"></div>
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400">
                  {article.category}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">•</span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                  {formatTimeAgo(article.created_at, lang)}
                </span>
              </div>
              
              <h3 className="text-base md:text-lg font-medium text-black dark:text-zinc-100 leading-snug group-hover:underline decoration-1 underline-offset-4 transition-all line-clamp-3 mb-1">
                {article.title}
              </h3>
              {article.author.role && (
                <p className="text-xs text-slate-500 dark:text-zinc-500 hidden md:block">
                  By {article.author.name}, {article.author.role}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

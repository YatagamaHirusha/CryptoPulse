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
  };
  category: string;
}

export default function VerticalCategorySection({ 
  title, 
  mainArticle,
  subArticle,
  viewAllLink,
  lang = 'en'
}: { 
  title: string; 
  mainArticle: Article;
  subArticle?: Article;
  viewAllLink: string;
  lang?: string;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Section Header - No bottom border for this variant */}
      <div className="flex items-center mb-6">
        <div className="w-1 h-5 bg-brand-red mr-3 flex-shrink-0"></div>
        <h2 className="text-lg font-sans font-medium text-black dark:text-white flex-shrink-0 mr-4">
          {title}
        </h2>
        <div className="flex-grow h-px bg-slate-200 dark:bg-zinc-800"></div>
        <Link 
          href={viewAllLink} 
          className="flex items-center text-sm text-slate-500 dark:text-zinc-400 hover:text-brand-red dark:hover:text-brand-red transition-colors flex-shrink-0 ml-4"
        >
          View All <ArrowRight size={12} className="ml-1" />
        </Link>
      </div>

      {/* Main Article */}
      <Link href={`/${lang}/article/${mainArticle.slug || mainArticle.id}`} className="group block mb-6">
        <div className="relative aspect-[3/2] rounded-lg overflow-hidden mb-4">
          <img
            src={mainArticle.cover_image}
            alt={mainArticle.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
        </div>
        
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-[10px] text-slate-500 dark:text-zinc-400">
            {mainArticle.category} • {formatTimeAgo(mainArticle.created_at, lang)}
          </span>
        </div>
        
        <h3 className="text-lg font-medium text-black dark:text-zinc-100 leading-snug group-hover:underline decoration-1 underline-offset-4 transition-all line-clamp-3">
          {mainArticle.title}
        </h3>
      </Link>

      {/* Sub Article (Text Only) */}
      {subArticle && (
        <Link href={`/${lang}/article/${subArticle.slug || subArticle.id}`} className="group block mt-auto">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">
              {subArticle.category} • {formatTimeAgo(subArticle.created_at, lang)}
            </span>
          </div>
          <h3 className="text-base font-medium text-black dark:text-zinc-100 leading-snug group-hover:underline decoration-1 underline-offset-4 transition-all line-clamp-3">
            {subArticle.title}
          </h3>
        </Link>
      )}
    </div>
  );
}

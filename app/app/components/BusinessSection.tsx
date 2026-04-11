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
  category: string;
}

export default function BusinessSection({ 
  title, 
  mainArticle, 
  listArticles, 
  viewAllLink,
  lang = 'en'
}: { 
  title: string; 
  mainArticle: Article; 
  listArticles: Article[]; 
  viewAllLink: string; 
  lang?: string;
}) {
  return (
    <section className="bg-white dark:bg-zinc-900 p-6 rounded-xl h-full border border-slate-200 dark:border-zinc-800 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="w-1 h-5 bg-brand-red mr-3 flex-shrink-0"></div>
        <h2 className="text-lg font-sans font-medium text-black dark:text-white flex-shrink-0 mr-4">{title}</h2>
        <div className="flex-grow h-px bg-slate-200 dark:bg-zinc-800"></div>
        <Link href={viewAllLink} className="flex items-center text-xs text-slate-500 dark:text-zinc-400 hover:text-brand-red dark:hover:text-brand-red transition-colors flex-shrink-0 ml-4">
          View All <ArrowRight size={12} className="ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: List */}
        <div className="space-y-8 pr-4">
          {listArticles.map((article) => (
            <Link key={article.id} href={`/${lang}/article/${article.slug || article.id}`} className="block group">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-light">
                  {article.category} • {formatTimeAgo(article.created_at, lang)}
                </span>
              </div>
              <h3 className="text-lg font-medium text-black dark:text-zinc-100 leading-snug group-hover:underline decoration-1 underline-offset-4 transition-all">
                {article.title}
              </h3>
            </Link>
          ))}
        </div>

        {/* Right: Main Image Overlay */}
        <div className="relative h-full min-h-[400px] rounded-xl overflow-hidden group">
          <Link href={`/${lang}/article/${mainArticle.slug || mainArticle.id}`} className="block h-full">
            <img 
              src={mainArticle.cover_image}  
              alt={mainArticle.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <div className="text-xs text-white/70 mb-2 font-light">
                {mainArticle.category} • {new Date(mainArticle.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <h3 className="text-xl font-medium text-white leading-tight group-hover:underline decoration-1 underline-offset-4 transition-all">
                {mainArticle.title}
              </h3>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

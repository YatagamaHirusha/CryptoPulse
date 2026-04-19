import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { formatTimeAgo } from '../lib/dateUtils';
import slugify from 'slugify';

export interface Article {
  id: string;
  slug?: string;
  title: string;
  excerpt: string;
  cover_image: string;
  created_at: string;
  author: {
    name: string;
    avatar: string;
    slug?: string;
    role?: string;
  };
  likes_count: number;
  views_count: number;
  category: string;
}

export default function ArticleCard({ article, featured = false, lang = 'en' }: { article: Article; featured?: boolean; lang?: string }) {
  const authorSlug = article.author.slug || slugify(article.author.name, { lower: true, strict: true });

  if (featured) {
    return (
      <div className="group block h-full relative">
        <Link href={`/${lang}/article/${article.slug || article.id}`} className="absolute inset-0 z-0" aria-label={article.title} />
        <div className="relative h-full min-h-[400px] rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0">
            <img
              src={article.cover_image}
              alt={article.title}
              className="absolute w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 p-8 w-full md:w-3/4 pointer-events-auto">
            <Link href={`/${lang}/${(article.category ?? 'news').toLowerCase()}`} className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider mb-4 rounded-sm hover:bg-blue-700 transition-colors relative z-10">
              {article.category ?? 'News'}
            </Link>
            <Link href={`/${lang}/article/${article.slug || article.id}`} className="block">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4 leading-tight group-hover:text-blue-400 transition-colors">
                {article.title}
              </h2>
            </Link>
            <p className="text-slate-300 text-lg line-clamp-2 mb-4 font-light">
              {article.excerpt}
            </p>
            <div className="flex items-center space-x-3 relative z-10">
              <Link href={`/${lang}/authors/${authorSlug}`} className="flex items-center space-x-3 group/author">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-8 h-8 rounded-full border-2 border-white/20 group-hover/author:border-blue-400 transition-colors"
                />
                <div className="text-sm">
                  <span className="text-white font-medium block group-hover/author:text-blue-400 transition-colors">
                    {article.author.name}
                    {article.author.role && <span className="text-slate-400 font-normal ml-1 text-xs">| {article.author.role}</span>}
                  </span>
                  <span className="text-slate-400 text-xs flex items-center">
                    <Clock size={12} className="mr-1" />
                    {formatTimeAgo(article.created_at, lang)}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col h-full">
      <Link href={`/${lang}/article/${article.slug || article.id}`} className="block overflow-hidden rounded-xl mb-4 relative aspect-[16/9]">
        <img
          src={article.cover_image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold uppercase tracking-wide rounded-sm">
            {article.category}
          </span>
        </div>
      </Link>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center space-x-2 mb-3 text-xs text-slate-500 dark:text-zinc-400">
          <Link href={`/${lang}/authors/${authorSlug}`} className="font-medium text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {article.author.name}
            {article.author.role && <span className="text-slate-500 dark:text-zinc-500 font-normal ml-1">({article.author.role})</span>}
          </Link>
          <span>•</span>
          <span>{formatTimeAgo(article.created_at, lang)}</span>
        </div>
        <Link href={`/${lang}/article/${article.slug || article.id}`} className="block">
          <h3 className="text-xl font-heading font-bold text-black dark:text-white mb-3 leading-snug group-hover:underline decoration-1 underline-offset-4 transition-all">
            {article.title}
          </h3>
        </Link>
        <p className="text-slate-600 dark:text-zinc-300 text-sm line-clamp-3 leading-relaxed">
          {article.excerpt}
        </p>
      </div>
    </div>
  );
}


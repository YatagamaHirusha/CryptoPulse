'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

export default function HeroSection({ 
  featuredArticles, 
  sideArticle, 
  listArticles,
  lang = 'en'
}: { 
  featuredArticles: Article[]; 
  sideArticle?: Article; 
  listArticles: Article[]; 
  lang?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleSlideChange((currentIndex + 1) % featuredArticles.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [currentIndex, featuredArticles.length]);

  const handleSlideChange = (index: number) => {
    if (index === currentIndex) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setTimeout(() => {
        setIsAnimating(false);
      }, 100);
    }, 400);
  };

  // Fallback if no featured articles
  if (!featuredArticles || featuredArticles.length === 0) return null;

  const currentArticle = featuredArticles[currentIndex];

  return (
    <section className="mb-16 pt-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Main Article Text (3 cols) */}
        <div className="lg:col-span-3 flex flex-col h-full order-2 lg:order-1 pt-4">
          <div className="min-h-[280px]">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-3 py-1 bg-red-100 border border-red-200 dark:bg-red-900/20 dark:border-red-800/40 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                {currentArticle.category}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {formatTimeAgo(currentArticle.created_at, lang)}
              </span>
            </div>
            
            <Link href={`/${lang}/article/${currentArticle.slug || currentArticle.id}`} className="group block">
              <h1 className="text-3xl md:text-4xl font-sans font-medium text-black dark:text-white mb-4 leading-tight group-hover:underline decoration-1 underline-offset-4 transition-all line-clamp-4">
                {currentArticle.title}
              </h1>
              <p className="text-slate-600 dark:text-zinc-400 text-base leading-relaxed font-light line-clamp-3 mb-4">
                {currentArticle.excerpt}
              </p>
              {currentArticle.author.role && (
                <p className="text-xs text-slate-500 dark:text-zinc-500">
                  By <span className="font-medium text-slate-700 dark:text-zinc-300">{currentArticle.author.name}</span>, {currentArticle.author.role}
                </p>
              )}
            </Link>
          </div>

          {/* Slider Indicators */}
          <div className="flex space-x-3 mt-4">
            {featuredArticles.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => handleSlideChange(idx)}
                className={`h-3 min-w-[24px] rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-10 bg-brand-red' : 'w-6 bg-slate-300 dark:bg-zinc-600 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Center Column: Main Article Image (6 cols) */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <Link href={`/${lang}/article/${currentArticle.slug || currentArticle.id}`} className="block h-full">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <img
                src={currentArticle.cover_image}
                alt={currentArticle.title}
                className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${isAnimating ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100'}`}
              />
            </div>
          </Link>
        </div>

        {/* Right Column: Sidebar (3 cols) */}
        <div className="lg:col-span-3 pl-0 lg:pl-4 border-l border-slate-200 dark:border-zinc-800 flex flex-col h-full order-3">
          {/* Sidebar Featured */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-1 h-5 bg-brand-red mr-3 flex-shrink-0"></div>
              <h2 className="text-lg font-sans font-medium text-black dark:text-white flex-shrink-0 mr-4">Finance</h2>
              <div className="flex-grow h-px bg-slate-200 dark:bg-zinc-800"></div>
              <Link href={`/${lang}/finance`} className="flex items-center text-sm text-slate-600 dark:text-zinc-300 hover:text-brand-red dark:hover:text-brand-red transition-colors flex-shrink-0 ml-4">
                View All <ArrowRight size={12} className="ml-1" />
              </Link>
            </div>
            
            {sideArticle && (
              <Link href={`/${lang}/article/${sideArticle.slug || sideArticle.id}`} className="group block mb-4">
                <div className="relative aspect-[3/2] rounded-2xl overflow-hidden mb-3">
                  <img
                    src={sideArticle.cover_image}
                    alt={`Cover image for article: ${sideArticle.title}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>
                <h4 className="text-lg font-medium text-black dark:text-zinc-100 leading-snug group-hover:text-brand-red transition-colors">
                  {sideArticle.title}
                </h4>
              </Link>
            )}
          </div>

          {/* Sidebar List */}
          <div className="flex-grow">
            {listArticles.map((article) => (
              <div key={article.id} className="mb-6 border-b border-slate-200 dark:border-zinc-800 pb-6 last:border-0 last:mb-0 last:pb-0">
                <div className="text-xs text-slate-500 dark:text-zinc-400 mb-2">
                  {article.category} • {formatTimeAgo(article.created_at, lang)}
                </div>
                <Link href={`/${lang}/article/${article.slug || article.id}`} className="block group">
                  <h4 className="text-base font-medium text-black dark:text-zinc-100 leading-snug group-hover:text-brand-red transition-colors">
                    {article.title}
                  </h4>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

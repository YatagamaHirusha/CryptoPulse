'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatTimeAgo } from '../lib/dateUtils';

interface Article {
  id: string;
  slug?: string;
  title: string;
  cover_image: string;
  created_at: string;
  category: string;
}

export default function TabbedSection({ 
  tabs,
  lang = 'en'
}: { 
  tabs: { 
    label: string; 
    articles: Article[]; 
    viewAllLink: string;
  }[];
  lang?: string;
}) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden h-full transition-colors duration-300">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`flex-1 py-5 text-base font-sans font-medium text-center transition-colors ${
              activeTab === index 
                ? 'bg-slate-200 dark:bg-zinc-800 text-black dark:text-white' 
                : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-6">
          {tabs[activeTab].articles.map((article) => (
            <Link key={article.id} href={`/${lang}/article/${article.slug || article.id}`} className="flex group items-start">
              <div className="w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden mr-4">
                <img 
                  src={article.cover_image} 
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 mb-1 font-light">
                  {article.category} • {new Date(article.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })}
                </div>
                <h3 className="text-sm font-medium text-black dark:text-zinc-100 leading-snug group-hover:underline decoration-1 underline-offset-2 transition-all line-clamp-3">
                  {article.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

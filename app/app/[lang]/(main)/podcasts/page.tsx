import Link from 'next/link';
import { PlayCircle } from 'lucide-react';
import { PODCASTS } from '../../../lib/podcasts';
import { TRANSLATIONS } from '../../../lib/translations';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: 'Crypto & Web3 Podcasts | Web3Instant',
    description: 'Listen to the best crypto podcasts. Insights, interviews, and discussions on blockchain, DeFi, and web3 technology.',
    alternates: {
      canonical: `/${lang}/podcasts`,
    },
  };
}

export default async function PodcastsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 border-b border-slate-200 dark:border-zinc-800 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Podcasts
              </h1>
              <p className="text-slate-600 dark:text-zinc-400">
                Listen to the latest insights and discussions from the Web3 world.
              </p>
            </div>
            <Link 
              href={`/${lang}`}
              className="hidden md:inline-flex text-brand-red hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors"
            >
              {t.latestNews.backToHome}
            </Link>
          </div>
        </div>

        {/* Podcasts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PODCASTS.map((podcast) => (
            <a 
              key={podcast.id}
              href={podcast.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <img 
                  src={podcast.cover_image} 
                  alt={podcast.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <PlayCircle className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" size={48} />
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-red transition-colors">
                  {podcast.title}
                </h3>
                <p className="text-slate-600 dark:text-zinc-400 text-sm line-clamp-3 leading-relaxed">
                  {podcast.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}

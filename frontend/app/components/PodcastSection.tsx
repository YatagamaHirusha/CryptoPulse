import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';

interface Podcast {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  category: string;
  link?: string;
}

export default function PodcastSection({ 
  mainPodcast, 
  listPodcasts,
  lang = 'en'
}: { 
  mainPodcast: Podcast; 
  listPodcasts: Podcast[];
  lang?: string;
}) {
  return (
    <section className="mb-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left: Main Image */}
        <div className="lg:col-span-7">
          <a 
            href={mainPodcast.link || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-5 shadow-sm">
              <img 
                src={mainPodcast.cover_image} 
                alt={mainPodcast.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <PlayCircle className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 drop-shadow-xl" size={64} />
              </div>
            </div>
            
            <div>
               <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-3 group-hover:text-brand-red transition-colors">
                 {mainPodcast.title}
               </h3>
               <p className="text-slate-600 dark:text-zinc-400 text-base leading-relaxed line-clamp-2">
                 {mainPodcast.description}
               </p>
            </div>
          </a>
        </div>

        {/* Right: Content */}
        <div className="lg:col-span-5">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-brand-red mr-3 flex-shrink-0"></div>
            <h2 className="text-xl font-sans font-bold text-black dark:text-white flex-shrink-0 mr-4">Podcast</h2>
            <div className="flex-grow h-px bg-slate-200 dark:bg-zinc-800"></div>
            <Link href={`/${lang}/podcasts`} className="flex items-center text-sm text-slate-500 dark:text-zinc-400 hover:text-brand-red dark:hover:text-brand-red transition-colors flex-shrink-0 ml-4">
              View All <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>

          <p className="text-slate-600 dark:text-zinc-300 mb-8 leading-relaxed">
            Dive into our Top selection of the best podcasts, featuring everything from latest tech to trending tunes. Press the play button now!
          </p>

          <div className="space-y-6">
            {listPodcasts.slice(0, 2).map((podcast) => (
              <a 
                key={podcast.id} 
                href={podcast.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start group cursor-pointer"
              >
                <div className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden mr-4">
                  <img 
                    src={podcast.cover_image} 
                    alt={podcast.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <PlayCircle className="text-white opacity-80 group-hover:opacity-100" size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm mb-1 group-hover:text-brand-red transition-colors">{podcast.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-snug line-clamp-2">
                    {podcast.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

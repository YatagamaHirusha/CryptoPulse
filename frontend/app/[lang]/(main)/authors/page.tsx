import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import PartnerBanner from '../../../components/PartnerBanner';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Authors - Web3Instant',
  description: 'Meet our team of journalists and contributors.',
};

async function getAuthors() {
  // First, get author IDs who have at least one published article
  const { data: authorIds, error: authorError } = await supabase
    .from('articles')
    .select('author_id')
    .eq('published', true)
    .not('author_id', 'is', null);

  if (authorError) {
    console.error('Error fetching author IDs:', authorError);
    return [];
  }

  // Get unique author IDs
  const uniqueAuthorIds = [...new Set(authorIds?.map(a => a.author_id) || [])];

  if (uniqueAuthorIds.length === 0) {
    return [];
  }

  // Fetch only profiles that have published articles
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', uniqueAuthorIds)
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
  return data || [];
}

export default async function AuthorsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const authors = await getAuthors();

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Page Header */}
        <div className="flex items-center mb-16">
          <div className="w-1 h-8 bg-brand-red mr-4"></div>
          <h1 className="text-3xl font-sans font-medium text-slate-900 dark:text-white">
            Authors
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {authors.map((author) => (
            <Link 
              key={author.id} 
              href={`/${lang}/authors/${author.slug}`}
              className="group flex flex-col items-center text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-brand-red/30 dark:hover:border-brand-red/30"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300">
                {author.avatar_url ? (
                  <img 
                    src={author.avatar_url} 
                    alt={author.full_name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-zinc-500 text-3xl font-bold">
                    {author.full_name?.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1 transition-colors">
                  {author.full_name}
                </h2>
                <p className="text-xs font-medium text-brand-red uppercase tracking-wider">
                  {author.role || 'Contributor'}
                </p>
              </div>
              
              <p className="text-slate-600 dark:text-zinc-400 line-clamp-3 mb-6 text-sm leading-relaxed flex-grow">
                {author.bio || 'No bio available.'}
              </p>

              <div className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-medium group-hover:bg-brand-red group-hover:text-white transition-colors duration-300">
                View Profile <ArrowRight size={14} className="ml-2" />
              </div>
            </Link>
          ))}
        </div>

        {authors.length === 0 && (
            <div className="text-center py-20">
                <p className="text-slate-500 dark:text-zinc-400">No authors found.</p>
            </div>
        )}

      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PartnerBanner lang={lang} />
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Twitter, Linkedin } from 'lucide-react';
// Footer component
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { TRANSLATIONS } from '../lib/translations';

interface FooterProps {
  activeCategories?: string[];
}

export default function Footer({ activeCategories }: FooterProps) {
  const params = useParams();
  const lang = params.lang as string || 'en';
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const shouldShowCategory = (key: string) => {
    if (!activeCategories) return true;
    if (key === 'technology') return activeCategories.includes('technology') || activeCategories.includes('tech');
    return activeCategories.includes(key);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          setStatus('error');
          setMessage('You are already subscribed!');
        } else {
          throw error;
        }
      } else {
        setStatus('success');
        setMessage('Thank you for subscribing!');
        setEmail('');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <footer className="bg-slate-50 dark:bg-zinc-900 border-t-4 border-brand-red pt-16 pb-8 text-black dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Subscribe */}
          <div className="col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-1 h-5 bg-brand-red mr-3"></div>
              <h3 className="font-bold text-black dark:text-white text-lg">{t.footer.subscribeTitle}</h3>
            </div>
            <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed mb-6">
              {t.newsletter.subtitle}
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="youremail@gmail.com" 
                  required
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-black dark:text-white text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-red disabled:opacity-50"
                  disabled={status === 'loading' || status === 'success'}
                />
                <button 
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="absolute right-1 top-1 bottom-1 bg-brand-red text-white text-xs font-bold px-4 rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? '...' : status === 'success' ? 'Done' : t.newsletter.button}
                </button>
              </div>
              {message && (
                <p className={`text-xs ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}
            </form>
            <p className="text-slate-600 dark:text-zinc-400 text-[10px] mt-3">
              {t.newsletter.spamPromise}
            </p>
          </div>

          {/* Column 2: Company */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-1 h-5 bg-brand-red mr-3"></div>
              <h3 className="font-bold text-black dark:text-white text-lg">{t.footer.company}</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-zinc-400">
              <li><Link href={`/${lang}/about`} className="hover:text-brand-red transition-colors">{t.footer.about}</Link></li>
              <li><Link href={`/${lang}/careers`} className="hover:text-brand-red transition-colors">{t.footer.careers}</Link></li>
              <li><Link href={`/${lang}/authors`} className="hover:text-brand-red transition-colors">{t.footer.authors}</Link></li>
              <li><Link href={`/${lang}/advertise`} className="hover:text-brand-red transition-colors">{t.footer.advertise}</Link></li>
              {/* <li><Link href={`/${lang}/contact`} className="hover:text-brand-red transition-colors">{t.footer.contact}</Link></li> */}
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-1 h-5 bg-brand-red mr-3"></div>
              <h3 className="font-bold text-black dark:text-white text-lg">{t.footer.categories}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ul className="space-y-3 text-sm text-slate-600 dark:text-zinc-400">
                {shouldShowCategory('bitcoin') && <li><Link href={`/${lang}/bitcoin`} className="hover:text-brand-red transition-colors">{t.categories.bitcoin}</Link></li>}
                {shouldShowCategory('ethereum') && <li><Link href={`/${lang}/ethereum`} className="hover:text-brand-red transition-colors">{t.categories.ethereum}</Link></li>}
                {shouldShowCategory('defi') && <li><Link href={`/${lang}/defi`} className="hover:text-brand-red transition-colors">{t.categories.defi}</Link></li>}
                {shouldShowCategory('nfts') && <li><Link href={`/${lang}/nfts`} className="hover:text-brand-red transition-colors">{t.categories.nfts}</Link></li>}
                {shouldShowCategory('technology') && <li><Link href={`/${lang}/technology`} className="hover:text-brand-red transition-colors">{t.categories.technology}</Link></li>}
              </ul>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-zinc-400">
                {shouldShowCategory('business') && <li><Link href={`/${lang}/business`} className="hover:text-brand-red transition-colors">{t.categories.business}</Link></li>}
                {shouldShowCategory('finance') && <li><Link href={`/${lang}/finance`} className="hover:text-brand-red transition-colors">{t.categories.finance}</Link></li>}
                {shouldShowCategory('politics') && <li><Link href={`/${lang}/politics`} className="hover:text-brand-red transition-colors">{t.categories.politics}</Link></li>}
                {shouldShowCategory('culture') && <li><Link href={`/${lang}/culture`} className="hover:text-brand-red transition-colors">{t.categories.culture}</Link></li>}
              </ul>
            </div>
          </div>

          {/* Column 4: Social Media */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-1 h-5 bg-brand-red mr-3"></div>
              <h3 className="font-bold text-black dark:text-white text-lg">{t.footer.socialMedia}</h3>
            </div>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-zinc-400">
              <li>
                <a href="#" className="flex items-center hover:text-brand-red transition-colors">
                  <Twitter size={18} className="mr-3" /> Twitter
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center hover:text-brand-red transition-colors">
                  <Linkedin size={18} className="mr-3" /> LinkedIn
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}

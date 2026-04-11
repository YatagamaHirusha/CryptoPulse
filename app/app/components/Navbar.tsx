'use client';

import Link from 'next/link';
import { Menu, X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { TRANSLATIONS } from '../lib/translations';

interface NavbarProps {
  activeCategories?: string[];
}

export default function Navbar({ activeCategories }: NavbarProps) {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const localeMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    ar: 'ar-SA'
  };
  const locale = localeMap[lang] || 'en-US';
  
  const [dateTime, setDateTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
      const time = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
      setDateTime(`${date} • ${time}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000 * 60); // Update every minute
    return () => clearInterval(interval);
  }, [locale]);

  const shouldShowCategory = (key: string) => {
    if (!activeCategories) return true;
    if (key === 'tech') return activeCategories.includes('technology') || activeCategories.includes('tech');
    return activeCategories.includes(key);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${lang}/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="font-sans transition-colors duration-300 z-40">
      {/* Top Info Bar (Date - Logo - Weather) */}
      <div className="hidden md:block bg-white dark:bg-black/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
          <div className="flex flex-col md:flex-row justify-between items-center relative">
            
            {/* Left: Date */}
            <div className="hidden md:block text-xs text-slate-500 dark:text-zinc-400 font-medium w-1/3 min-h-[1rem]">
              {dateTime}
            </div>

            {/* Center: Logo */}
            <div className="hidden md:flex w-full md:w-1/3 justify-center mb-2 md:mb-0">
              <Link href={`/${lang}`} className="group">
                <div className="text-4xl font-logo font-bold tracking-tighter text-slate-900 dark:text-white">
                  web3<span className="text-brand-red">instant</span>
                </div>
              </Link>
            </div>

            {/* Right: Partner Link */}
            <div className="hidden md:flex justify-end items-center w-1/3 gap-4">
              <Link 
                href={`/${lang}/#partner`}
                className="text-xs text-slate-500 dark:text-zinc-400 font-medium hover:text-brand-red transition-colors"
              >
                Partner with us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Red Navigation Bar */}
      <div className="bg-brand-red text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            
            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:text-slate-200 focus:outline-none p-2"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Mobile Logo */}
            <div className="md:hidden flex-1 flex justify-center">
              <Link href={`/${lang}`} className="text-xl font-logo font-bold tracking-tighter text-white">
                web3<span className="text-white">instant</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 w-full">
              <Link href={`/${lang}/latest-news`} className="px-3 py-3 text-xs font-bold uppercase tracking-wider hover:bg-black/10 transition-colors border-r border-white/10">
                {t.nav.latestNews}
              </Link>
              {[
                { key: 'pr', label: t.nav.pr },
                { key: 'bitcoin', label: t.nav.bitcoin },
                { key: 'ethereum', label: t.nav.ethereum },
                { key: 'defi', label: t.nav.defi },
                { key: 'nfts', label: t.nav.nfts },
                { key: 'gaming', label: t.nav.gaming },
                { key: 'metaverse', label: t.nav.metaverse },
                { key: 'regulation', label: t.nav.regulation },
                { key: 'finance', label: t.nav.finance },
                { key: 'tech', label: t.nav.tech }
              ].filter(item => shouldShowCategory(item.key)).map((item) => (
                <Link
                  key={item.key}
                  href={`/${lang}/${item.key}`}
                  className="px-3 py-3 text-xs font-medium hover:text-white/80 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4 pl-4 border-l border-white/10 h-full">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center bg-white rounded text-black animate-in fade-in slide-in-from-right-5 duration-200">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.nav.searchPlaceholder}
                    className="px-3 py-1 text-sm w-40 focus:outline-none rounded-l bg-transparent"
                    autoFocus
                    onBlur={() => !searchQuery && setIsSearchOpen(false)}
                  />
                  <button type="submit" className="px-2 text-brand-red hover:text-red-700">
                    <Search size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="pr-2 pl-1 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="text-white hover:text-slate-200 transition-colors"
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
              )}
              <div className="h-4 w-px bg-white/20"></div>
              <LanguageSelector />
              <div className="h-4 w-px bg-white/20"></div>
              <div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div className="md:hidden bg-brand-red border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                  href={`/${lang}/latest-news`}
                  className="block px-3 py-2 text-sm font-medium text-white hover:bg-black/10 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {t.nav.latestNews}
              </Link>
              {[
                { key: 'pr', label: t.nav.pr },
                { key: 'bitcoin', label: t.nav.bitcoin },
                { key: 'ethereum', label: t.nav.ethereum },
                { key: 'defi', label: t.nav.defi },
                { key: 'nfts', label: t.nav.nfts },
                { key: 'gaming', label: t.nav.gaming },
                { key: 'finance', label: t.nav.finance }
              ].filter(item => shouldShowCategory(item.key)).map((item) => (
                <Link
                  key={item.key}
                  href={`/${lang}/${item.key}`}
                  className="block px-3 py-2 text-sm font-medium text-white hover:bg-black/10 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}


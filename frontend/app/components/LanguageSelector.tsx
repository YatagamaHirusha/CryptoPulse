'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Extract current language from pathname
  const segments = pathname.split('/');
  const currentLangCode = segments[1];
  const currentLang = ['en', 'es', 'fr', 'ar'].includes(currentLangCode) ? currentLangCode : 'en';

  const currentLanguage = LANGUAGES.find(lang => lang.code === currentLang) || LANGUAGES[0];

  const handleLanguageChange = (langCode: string) => {
    setIsOpen(false);
    
    const newSegments = [...pathname.split('/')];
    // Ensure we have a leading slash split resulting in empty first element
    if (newSegments[0] === '') {
      if (['en', 'es', 'fr', 'ar'].includes(newSegments[1])) {
        newSegments[1] = langCode;
      } else {
        // If for some reason we are at root without lang (shouldn't happen due to redirect), prepend
        newSegments.splice(1, 0, langCode);
      }
    } else {
       // Path doesn't start with / ?
       newSegments.unshift('', langCode);
    }
    
    const newPath = newSegments.join('/') || '/';
    router.push(newPath);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all duration-200"
      >
        <span className="text-lg leading-none filter drop-shadow-sm">{currentLanguage.flag}</span>
        {isOpen ? (
          <ChevronUp size={14} className="text-white/90" />
        ) : (
          <ChevronDown size={14} className="text-white/90" />
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/20 dark:border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg leading-none">{lang.flag}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-zinc-200 group-hover:text-slate-900 dark:group-hover:text-white">
                    {lang.name}
                  </span>
                </div>
                {lang.code === currentLang && (
                  <Check size={14} className="text-slate-900 dark:text-white" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function PartnerBanner({ lang = 'en' }: { lang?: string }) {
  return (
    <section id="partner" className="my-16 scroll-mt-32 md:scroll-mt-48">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden relative transition-colors duration-300">
        
        <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Partner with <span className="text-brand-red">Web3Instant</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
              Reach a highly engaged audience of investors, developers, and crypto enthusiasts. 
              Join our ecosystem to amplify your brand's voice in the Web3 space.
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <Link 
              href={`/${lang}/advertise`}
              className="inline-flex items-center px-8 py-4 bg-brand-red text-white font-bold text-lg rounded-lg hover:bg-red-700 transition-all group"
            >
              Become a Partner
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

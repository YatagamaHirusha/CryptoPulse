'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useParams } from 'next/navigation';
import { TRANSLATIONS } from '../lib/translations';

export default function Newsletter() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

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
          setMessage(t.newsletter.alreadySubscribed);
        } else {
          throw error;
        }
      } else {
        setStatus('success');
        setMessage(t.newsletter.successMessage);
        setEmail('');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setStatus('error');
      setMessage(t.newsletter.errorMessage);
    }
  };

  return (
    <section className="bg-slate-900 rounded-2xl p-8 md:p-16 text-center my-16 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      <div className="relative z-10 max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-4">
          {t.newsletter.title}
        </h2>
        <p className="text-slate-400 text-lg mb-8">
          {t.newsletter.subtitle}
        </p>
        
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.newsletter.placeholder}
            className="flex-1 px-5 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            required
            disabled={status === 'loading' || status === 'success'}
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? t.newsletter.buttonLoading : status === 'success' ? t.newsletter.buttonSuccess : t.newsletter.button}
          </button>
        </form>
        {message && (
          <p className={`text-sm mt-4 ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
        <p className="text-slate-500 text-xs mt-4">
          {t.newsletter.spamPromise}
        </p>
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import { Check, Upload, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface JobPosition {
  id: string;
  title: string;
  slug: string;
}

export default function ApplicationForm({ job, lang }: { job: JobPosition; lang: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
    cover_letter: '',
    resume_link: '' // Using link for simplicity if storage isn't set up, or I can add a file input UI that just takes the name for now
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: submitError } = await supabase
        .from('job_applications')
        .insert([{
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
          resume_link: formData.resume_link,
          cover_letter: formData.cover_letter,
          position_title: job.title,
          position_slug: job.slug,
          status: 'new'
        }]);

      if (submitError) throw submitError;

      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-slate-50 dark:bg-zinc-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-zinc-800">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Application Sent!</h2>
        <p className="text-slate-600 dark:text-zinc-400 mb-8">
          Thanks for applying to the <strong>{job.title}</strong> position. We've received your application and will review it shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${lang}/careers`}
            className="px-8 py-3 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
          >
            View More Jobs
          </Link>
          <Link
            href={`/${lang}`}
            className="px-8 py-3 bg-brand-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
            Full Name <span className="text-brand-red">*</span>
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            required
            value={formData.full_name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
            Email Address <span className="text-brand-red">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder="john@example.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="linkedin" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
            LinkedIn URL
          </label>
          <input
            type="url"
            id="linkedin"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder="https://linkedin.com/in/..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="portfolio" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
          Portfolio / Website
        </label>
        <input
          type="url"
          id="portfolio"
          name="portfolio"
          value={formData.portfolio}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="resume_link" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
          Resume / CV Link <span className="text-brand-red">*</span>
        </label>
        <input
          type="url"
          id="resume_link"
          name="resume_link"
          required
          value={formData.resume_link}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
          placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
        />
        <p className="text-xs text-slate-500 dark:text-zinc-500">
          Please provide a public link to your resume PDF.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="cover_letter" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
          Cover Letter / Additional Info
        </label>
        <textarea
          id="cover_letter"
          name="cover_letter"
          rows={6}
          value={formData.cover_letter}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
          placeholder="Tell us why you're a great fit for this role..."
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-red text-white font-bold py-4 px-8 rounded-xl hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Submitting Application...
            </>
          ) : (
            <>
              Submit Application <ArrowRight className="ml-2" size={20} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

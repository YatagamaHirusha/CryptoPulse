import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, Briefcase, CheckCircle } from 'lucide-react';
import { OPEN_POSITIONS } from '@/lib/careers';
import PartnerBanner from '../../../../components/PartnerBanner';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = OPEN_POSITIONS.find((p) => p.slug === slug);
  
  if (!job) {
    return {
      title: 'Job Not Found - Web3Instant',
    };
  }

  return {
    title: `${job.title} - Careers at Web3Instant`,
    description: job.description,
  };
}

export default async function JobPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const job = OPEN_POSITIONS.find((p) => p.slug === slug);

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Page Header */}
        <div className="flex items-center mb-16">
          <div className="w-1 h-8 bg-brand-red mr-4"></div>
          <div className="text-3xl font-sans font-medium text-slate-900 dark:text-white">
            Careers
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-start">
          
          {/* Left Column: Meta & Back Link */}
          <div className="lg:col-span-4 space-y-8 lg:pr-12 lg:border-r lg:border-slate-200 dark:lg:border-zinc-800 lg:sticky lg:top-32">
            <Link 
              href={`/${lang}/careers`}
              className="inline-flex items-center text-slate-500 dark:text-zinc-400 hover:text-brand-red dark:hover:text-brand-red transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Careers
            </Link>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">Department</h3>
                <div className="flex items-center text-slate-900 dark:text-white font-medium">
                  <Briefcase size={18} className="mr-2 text-brand-red" />
                  {job.department}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">Location</h3>
                <div className="flex items-center text-slate-900 dark:text-white font-medium">
                  <MapPin size={18} className="mr-2 text-brand-red" />
                  {job.location}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">Type</h3>
                <div className="flex items-center text-slate-900 dark:text-white font-medium">
                  <Clock size={18} className="mr-2 text-brand-red" />
                  {job.type}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-8 lg:pl-12">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8">
              {job.title}
            </h1>

            <div className="prose dark:prose-invert max-w-none">
              <div className="mb-12">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About the Role</h2>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-lg">
                  {job.description}
                </p>
              </div>

              <div className="mb-12">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Key Responsibilities</h2>
                <ul className="space-y-4">
                  {job.responsibilities.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle size={20} className="text-brand-red mr-3 flex-shrink-0 mt-1" />
                      <span className="text-slate-600 dark:text-zinc-400 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-12">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Requirements</h2>
                <ul className="space-y-4">
                  {job.requirements.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="w-2 h-2 bg-brand-red rounded-full mr-4 mt-2.5 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-zinc-400 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 text-left">
              <Link
                href={`/${lang}/careers/${slug}/apply`}
                className="inline-flex items-center justify-center px-8 py-3 bg-brand-red text-white font-bold rounded-xl hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5"
              >
                Apply Now
              </Link>
            </div>
          </div>

        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PartnerBanner lang={lang} />
      </div>
    </div>
  );
}

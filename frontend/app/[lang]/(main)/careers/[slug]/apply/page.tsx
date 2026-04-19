import React from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { OPEN_POSITIONS } from '@/lib/careers';
import PartnerBanner from '../../../../../components/PartnerBanner';
import ApplicationForm from './ApplicationForm';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = OPEN_POSITIONS.find((p) => p.slug === slug);
  
  if (!job) {
    return {
      title: 'Job Not Found - Web3Instant',
    };
  }

  return {
    title: `Apply for ${job.title} - Web3Instant`,
    description: `Submit your application for the ${job.title} position at Web3Instant.`,
  };
}

export default async function ApplyPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
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
          <h1 className="text-3xl font-sans font-medium text-slate-900 dark:text-white">
            Apply
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-start">
          
          {/* Left Column: Job Info & Back Link - Sticky */}
          <div className="lg:col-span-4 space-y-8 lg:pr-12 lg:border-r lg:border-slate-200 dark:lg:border-zinc-800 lg:sticky lg:top-32">
            <Link 
              href={`/${lang}/careers/${slug}`}
              className="inline-flex items-center text-slate-500 dark:text-zinc-400 hover:text-brand-red dark:hover:text-brand-red transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Job Description
            </Link>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">Role</h3>
                <div className="text-slate-900 dark:text-white font-medium text-lg">
                  {job.title}
                </div>
              </div>

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

          {/* Right Column: Application Form */}
          <div className="lg:col-span-8 lg:pl-12">
            <div className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 md:p-10 shadow-sm">
              <ApplicationForm job={job} lang={lang} />
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

import React from 'react';
import PartnerBanner from '../../../components/PartnerBanner';
import { ArrowRight, Briefcase, Globe, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { OPEN_POSITIONS } from '@/lib/careers';

export const metadata = {
  title: 'Careers - Web3Instant',
  description: 'Join our team at Web3Instant and help shape the future of news.',
};

const BENEFITS = [
  {
    icon: <Globe className="w-6 h-6 text-brand-red" />,
    title: "Remote First",
    description: "Work from anywhere in the world. We believe in talent, not geography."
  },
  {
    icon: <Zap className="w-6 h-6 text-brand-red" />,
    title: "Cutting Edge",
    description: "Work with the latest technologies in Web3 and digital media."
  },
  {
    icon: <Users className="w-6 h-6 text-brand-red" />,
    title: "Great Culture",
    description: "Join a diverse, inclusive team that values creativity and integrity."
  },
  {
    icon: <Briefcase className="w-6 h-6 text-brand-red" />,
    title: "Growth",
    description: "Continuous learning opportunities and career advancement paths."
  }
];

export default async function CareersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Page Header */}
        <div className="flex items-center mb-16">
          <div className="w-1 h-8 bg-brand-red mr-4"></div>
          <h1 className="text-3xl font-sans font-medium text-slate-900 dark:text-white">
            Careers
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-start">
          
          {/* Left Column: Intro & Benefits */}
          <div className="lg:col-span-4 space-y-12 lg:pr-12 lg:border-r lg:border-slate-200 dark:lg:border-zinc-800 lg:sticky lg:top-32">
            {/* Intro */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Join Our Team
              </h2>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                At Web3Instant, we're building the future of digital news. We're looking for passionate individuals who want to make an impact in the world of Web3 and journalism.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 gap-8">
              {BENEFITS.map((benefit, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <div className="p-2 bg-brand-red/10 rounded-lg flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">{benefit.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Image & Open Positions */}
          <div className="lg:col-span-8 lg:pl-12">
            {/* Hero Image */}
            <div className="relative aspect-[16/8] rounded-2xl overflow-hidden mb-12 shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000" 
                alt="Web3Instant Team" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <p className="text-white text-xl font-medium">Building the future of news, together.</p>
              </div>
            </div>

            {/* Open Positions */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Open Positions</h2>
              
              <div className="space-y-4">
                {OPEN_POSITIONS.map((job) => (
                  <Link 
                    key={job.id}
                    href={`/${lang}/careers/${job.slug}`}
                    className="block group bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-zinc-400">
                          <span className="bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-slate-200 dark:border-zinc-700">
                            {job.department}
                          </span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.type}</span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <span 
                          className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm font-medium rounded-lg border border-slate-200 dark:border-zinc-700 transition-all duration-300"
                        >
                          View Role <ArrowRight size={16} className="ml-2" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-12 group relative rounded-2xl p-[2px]">
                <div className="absolute inset-0 rounded-2xl bg-slate-200 dark:bg-zinc-800 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-brand-red group-hover:via-red-400 group-hover:to-brand-red group-hover:animate-border-flow" />
                <div className="relative h-full w-full rounded-2xl bg-slate-50 dark:bg-zinc-900 p-8 text-center transition-all duration-300 group-hover:bg-white dark:group-hover:bg-zinc-900">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Don't see the right role?</h3>
                  <p className="text-slate-600 dark:text-zinc-400 mb-6">
                    We're always looking for talented people to join our team. Send us your resume and we'll keep you in mind for future openings.
                  </p>
                  <Link 
                    href={`/${lang}/contact?subject=General Application`}
                    className="inline-flex items-center justify-center px-6 py-3 bg-brand-red text-white font-bold rounded-xl hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
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

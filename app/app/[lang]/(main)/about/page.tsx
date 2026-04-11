import React from 'react';
import PartnerBanner from '../../../components/PartnerBanner';

export const metadata = {
  title: 'About Us - Web3Instant',
  description: 'Learn about our mission and vision at Web3Instant.',
};

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Page Header */}
        <div className="flex items-center mb-16">
          <div className="w-1 h-8 bg-brand-red mr-4"></div>
          <h1 className="text-3xl font-sans font-medium text-slate-900 dark:text-white">
            About us
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0">
          
          {/* Left Column: Mission & Vision */}
          <div className="lg:col-span-4 space-y-12 lg:pr-12 lg:border-r lg:border-slate-200 dark:lg:border-zinc-800">
            {/* Mission */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Our Mission
              </h2>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                To deliver unbiased, timely, and comprehensive news that empowers readers 
                to make informed decisions and fosters a deeper understanding of global events.
              </p>
            </div>

            {/* Vision */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Our Vision
              </h2>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                To be the most trusted and influential source of news, shaping global 
                conversations and connecting the world through responsible journalism.
              </p>
            </div>
          </div>

          {/* Right Column: Image & Description */}
          <div className="lg:col-span-8 lg:pl-12">
            {/* Building Image */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-8 shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000" 
                alt="Web3Instant Headquarters" 
                className="w-full h-full object-cover"
              />
              {/* Optional: Overlay for branding if needed, keeping it clean for now */}
            </div>

            {/* Main Description */}
            <div className="prose dark:prose-invert max-w-none space-y-6">
              <p className="text-slate-600 dark:text-zinc-400 text-lg leading-relaxed">
                Web3Instant is the country’s leading online news agency, connecting millions of readers with timely, accurate, and impactful news from across the globe. Our mission is to provide reliable coverage on everything the world needs to know about the US and everything the US needs to know about the world. From breaking news to in-depth analysis on politics, business, culture, and international affairs, we are committed to delivering the information you need to stay informed.
              </p>
              <p className="text-slate-600 dark:text-zinc-400 text-lg leading-relaxed">
                At Web3Instant, we believe news should go beyond just reporting the facts; it should provide context, insight, and understanding. Our dedicated team of journalists works around the clock to ensure you get not only the headlines but also the deeper stories that shape our society. Whether it’s the latest political developments or economic trends, we bring a balanced and critical perspective, empowering our readers with the knowledge to make informed decisions.
              </p>
              <p className="text-slate-600 dark:text-zinc-400 text-lg leading-relaxed">
                We are proud of our commitment to journalistic integrity, delivering unbiased, fair, and transparent news. Our editorial team adheres to the highest standards, focusing on accuracy and depth to ensure that every story reflects the truth without sensationalism. In a world overwhelmed by information, Web3Instant stands out as a trusted source that prioritizes clarity and credibility.
              </p>
              <p className="text-slate-600 dark:text-zinc-400 text-lg leading-relaxed">
                In addition to our domestic coverage, Web3Instant has a strong international presence, with correspondents around the globe providing firsthand reporting on global events. We believe that understanding international developments is key to understanding national ones, and our global reach allows us to bring you a truly comprehensive perspective on world affairs.
              </p>
              <p className="text-slate-600 dark:text-zinc-400 text-lg leading-relaxed">
                As a digital-first platform, Web3Instant is committed to innovation, utilizing cutting-edge technology to deliver news in accessible and engaging formats. Whether you’re browsing on your phone, tablet, or desktop, we ensure you can stay informed wherever you are. Our goal is simple: to empower readers by delivering news that shapes opinions, sparks conversations, and connects you to the world.
              </p>
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

import { supabase } from '../../lib/supabase';
import HeroSection from '../../components/HeroSection';
import CategorySection from '../../components/CategorySection';
import TopStoriesSection from '../../components/TopStoriesSection';
import BusinessSection from '../../components/BusinessSection';
import TabbedSection from '../../components/TabbedSection';
import PodcastSection from '../../components/PodcastSection';
import VerticalCategorySection from '../../components/VerticalCategorySection';
import Newsletter from '../../components/Newsletter';
import PartnerBanner from '../../components/PartnerBanner';
import { redirect } from 'next/navigation';
import { PODCASTS } from '../../lib/podcasts';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: 'Web3Instant - Latest Crypto & Web3 News',
    description: 'Stay updated with the latest crypto news, web3 trends, and blockchain technology updates. Your daily source for crypto hot topics and blogs.',
    alternates: {
      canonical: `/${lang}`,
    },
  };
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Validate language
  const validLangs = ['en', 'es', 'fr', 'ar'];
  if (!validLangs.includes(lang)) {
    // Fallback or 404 could go here
  }

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('published', true)
    .eq('language', lang) // Filter by language
    .order('created_at', { ascending: false })
    .limit(50);

  const formattedArticles = articles?.map(article => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt || '',
    cover_image: article.cover_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1600',
    created_at: article.created_at,
    author: {
      name: article.author_name || 'Unknown Author',
      avatar: article.author_avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=100',
      role: article.author_role
    },
    category: article.category,
    slug: article.slug
  })) || [];

  const allArticles = formattedArticles;

  // Helper to safely get articles (cycling if we don't have enough)
  const getArticle = (index: number) => allArticles[index % allArticles.length];

  // Dynamic Category Logic for Bottom Grid
  const preferredCategories = ['DeFi', 'NFTs', 'Gaming', 'Regulation', 'Metaverse', 'Technology', 'Finance', 'Politics', 'Culture'];
  const bottomSections = [];
  
  for (const cat of preferredCategories) {
    if (bottomSections.length >= 4) break;
    
    const catArticles = allArticles.filter(a => 
      (a.category.toLowerCase() === cat.toLowerCase() || 
      (cat === 'Gaming' && a.category.toLowerCase().includes('gam')))
    );
    
    if (catArticles.length > 0) {
      bottomSections.push({
        title: cat,
        main: catArticles[0],
        sub: catArticles[1],
        link: `/${lang}/${cat.toLowerCase()}`
      });
    }
  }
  
  // Fallback if we don't have enough categories
  if (bottomSections.length < 4) {
     const remaining = 4 - bottomSections.length;
     for (let i = 0; i < remaining; i++) {
        bottomSections.push({
           title: 'Latest',
           main: getArticle(15 + i * 2),
           sub: getArticle(16 + i * 2),
           link: `/${lang}/latest-news`
        });
     }
  }

  // If no articles, show placeholder
  if (allArticles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">No Articles Yet for {lang.toUpperCase()}</h1>
        <p className="text-slate-600 dark:text-zinc-400">Run the news bot to generate articles.</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section (Main + Sidebar) */}
        <HeroSection 
          featuredArticles={[getArticle(0), getArticle(1), getArticle(2), getArticle(3)]} 
          sideArticle={getArticle(4)}
          listArticles={[getArticle(5)]}
          lang={lang}
        />

        {/* Latest News Grid (3 Columns) */}
        <CategorySection 
          title="Latest News" 
          articles={[getArticle(8), getArticle(9), getArticle(10)]} 
          viewAllLink={`/${lang}/latest-news`}
          columns={3}
          lang={lang}
        />

        {/* Top Stories (Large Left + List Right) */}
        <TopStoriesSection
          title="Top Stories"
          mainArticle={getArticle(11)}
          listArticles={[getArticle(12), getArticle(13), getArticle(14), getArticle(15)]}
          lang={lang}
        />

        {/* Politics Section (4 Columns) */}
        <CategorySection 
          title="Politics" 
          articles={[getArticle(11), getArticle(7), getArticle(0), getArticle(4)]} 
          viewAllLink={`/${lang}/politics`}
          columns={4}
          lang={lang}
        />

        {/* Business & Bitcoin/Ethereum Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Business Section (8 cols) */}
          <div className="lg:col-span-8">
            <BusinessSection 
              title="Business"
              mainArticle={getArticle(16)}
              listArticles={[getArticle(17), getArticle(18), getArticle(19), getArticle(16)]}
              viewAllLink={`/${lang}/business`}
              lang={lang}
            />
          </div>

          {/* TabbedSection (4 cols) */}
          <div className="lg:col-span-4">
            <TabbedSection 
              tabs={[
                {
                  label: 'Bitcoin',
                  articles: allArticles.filter(a => a.category.toLowerCase() === 'bitcoin').slice(0, 4),
                  viewAllLink: `/${lang}/bitcoin`
                },
                {
                  label: 'Ethereum',
                  articles: allArticles.filter(a => a.category.toLowerCase() === 'ethereum').slice(0, 4),
                  viewAllLink: `/${lang}/ethereum`
                }
              ]}
              lang={lang}
            />
          </div>
        </div>

        {/* Bottom Grid (Dynamic Categories) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {bottomSections.map((section, idx) => (
            <VerticalCategorySection 
              key={idx}
              title={section.title} 
              mainArticle={section.main} 
              subArticle={section.sub}
              viewAllLink={section.link}
              lang={lang}
            />
          ))}
        </div>

        {/* Podcast Section */}
        <PodcastSection 
          mainPodcast={PODCASTS[0]}
          listPodcasts={PODCASTS.slice(1)}
          lang={lang}
        />

        <PartnerBanner />

      </div>
      

    </>
  );
}



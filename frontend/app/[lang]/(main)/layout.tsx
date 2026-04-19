import { supabase } from '../../lib/supabase';
import { publishedArticlesFrom } from '../../lib/articleQueries';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CryptoTicker from '../../components/CryptoTicker';

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const { data: categories } = await publishedArticlesFrom(supabase, lang, "category");

  const activeCategories: string[] = Array.from(
    new Set(
      (categories ?? [])
        .map((c: { category?: string | null }) => c.category?.toLowerCase())
        .filter((c: string | undefined): c is string => Boolean(c))
    )
  );

  return (
    <>
      <CryptoTicker />
      <div className="sticky top-0 left-0 right-0 z-50">
        <Navbar activeCategories={activeCategories} />
      </div>
      <main className="min-h-screen">
        {children}
      </main>
      <Footer activeCategories={activeCategories} />
    </>
  );
}

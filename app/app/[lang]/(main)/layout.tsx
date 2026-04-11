import { supabase } from '../../lib/supabase';
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

  // Fetch active categories
  const { data: categories } = await supabase
    .from('articles')
    .select('category')
    .eq('published', true)
    .eq('language', lang);

  const activeCategories = Array.from(new Set(categories?.map(c => c.category.toLowerCase()) || []));

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

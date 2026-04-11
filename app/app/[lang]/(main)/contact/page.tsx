'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ContactPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black">
      <Loader2 className="h-8 w-8 animate-spin text-brand-red mb-4" />
      <p className="text-slate-500 text-sm">Redirecting to home...</p>
    </div>
  );
}

import type { Metadata } from "next";
import { Inter, Outfit, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { ThemeProvider } from "./components/ThemeProvider";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});
const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: '--font-outfit',
  display: 'swap',
  preload: true,
});
const ibmPlexSans = IBM_Plex_Sans({ 
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"], 
  variable: '--font-ibm-plex',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://web3instant.com'), // TODO: Update with actual domain
  title: {
    default: "Web3Instant - Crypto & Finance News",
    template: "%s | Web3Instant"
  },
  applicationName: 'Web3Instant',
  appleWebApp: {
    title: 'Web3Instant',
    statusBarStyle: 'default',
  },
  description: "Stay ahead with Web3Instant: Your premier source for real-time updates on Web3, Blockchain technology, Cryptocurrency markets, and Traditional Finance insights.",
  keywords: ["Web3Instant", "Web3 Instant", "Web3Instant News", "crypto news", "web3 news", "crypto hot topics", "crypto blogs", "blockchain news", "finance news", "bitcoin", "ethereum", "cryptocurrency"],
  openGraph: {
    title: "Web3Instant - Crypto & Finance News",
    description: "Stay ahead with Web3Instant: Your premier source for real-time updates on Web3, Blockchain technology, Cryptocurrency markets, and Traditional Finance insights.",
    url: 'https://web3instant.com',
    siteName: 'Web3Instant',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://web3instant.com/web-app-manifest-512x512.png',
        width: 512,
        height: 512,
        alt: 'Web3Instant Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Web3Instant - Crypto & Finance News",
    description: "Real-time updates on Web3, Blockchain, and Traditional Finance.",
    creator: '@Web3Instant', // Update if known
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      { url: '/web-app-manifest-192x192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: '4n6it-_gx9pGtFKPcap85OknnKrrTwlja-wxBO9k3TE',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script src="https://analytics.ahrefs.com/analytics.js" data-key="2nr4hE3G2EB/EQ+l21X5RA" async></script>
        <link rel="preconnect" href="https://images.cointelegraph.com" />
        <link rel="dns-prefetch" href="https://images.cointelegraph.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "name": "Web3Instant",
                  "url": "https://web3instant.com",
                  "logo": "https://web3instant.com/android-chrome-512x512.png",
                  "sameAs": [
                    "https://twitter.com/Web3Instant"
                  ]
                },
                {
                  "@type": "WebSite",
                  "name": "Web3Instant",
                  "url": "https://web3instant.com",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://web3instant.com/search?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            })
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var theme = stored || 'dark';
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                    document.documentElement.style.colorScheme = 'light';
                  } else {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${ibmPlexSans.variable} font-sans bg-white dark:bg-black text-slate-900 dark:text-white antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="theme"
          disableTransitionOnChange
        >
          <GoogleAnalytics gaId="G-RZ82HY14P7" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizeCss: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400, // 31 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'cimg.co',
      },
      {
        protocol: 'https',
        hostname: '*.cointelegraph.com',
      },
      {
        protocol: 'https',
        hostname: '*.coindesk.com',
      },
      {
        protocol: 'https',
        hostname: '*.decrypt.co',
      },
      {
        protocol: 'https',
        hostname: '*.beincrypto.com',
      },
      {
        protocol: 'https',
        hostname: 'cloudfront.net',
      },
    ],
  },
};

export default nextConfig;

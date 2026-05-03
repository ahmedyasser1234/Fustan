import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com', 'api.photoroom.com'],
  },
  /* headers() removed - handled by Nginx */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // Proxy to NestJS backend
      },
      {
        source: '/sitemap.xml',
        destination: 'http://localhost:3001/api/seo/sitemap.xml',
      },
    ];
  },
};

export default nextConfig;

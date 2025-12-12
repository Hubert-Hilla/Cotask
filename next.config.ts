/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: [
      'cotask.org',
      'ymctgncumdbzhtnjtrqd.storage.supabase.co'
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
          }
        ],
      },
    ];
  },

  // Disable source maps in production for security
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
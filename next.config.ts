import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Temporarily disable PPR due to build issues with route groups
    // ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' 'inline-speculation-rules' https://cdn.jsdelivr.net https://unpkg.com chrome-extension://40131f7c-cce9-4d0c-90ef-ea4cfe3f5e41/",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "media-src 'self' data: blob:",
              "connect-src 'self' wss: ws: https:",
              "font-src 'self' data:",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ];
  }
};

export default nextConfig;

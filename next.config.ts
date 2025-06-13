import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    serverActions: {
      allowedOrigins: ['localhost:3000', 'vercel.app'],
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  webpack: (config) => {
    config.snapshot = {
      ...config.snapshot,
      managedPaths: [],
    };
    return config;
  },
};

export default nextConfig;

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
};

export default nextConfig;

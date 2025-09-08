import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript error checking
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint error checking
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  serverExternalPackages: ['@genkit-ai/googleai'],
  allowedDevOrigins: [
    '9003-firebase-studio-1748718921954.cluster-2xfkbshw5rfguuk5qupw267afs.cloudworkstations.dev',
    '*.cloudworkstations.dev',
    '*.googleusercontent.com'
  ],
};

export default nextConfig;
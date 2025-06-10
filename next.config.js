const path = require('path');
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Experimental features can be added here if needed
  },
  webpack: (config, { isServer }) => {
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/app': path.resolve(__dirname, 'src/app'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/styles': path.resolve(__dirname, 'src/styles'),
    };

    // Important: return the modified config
    return config;
  },
  compiler: {
    // Enable styled-components if you're using them
    // styledComponents: true,
  },
  // Disable TypeScript type checking during build for faster builds
  typescript: {
    ignoreBuildErrors: false,
  },
  // Disable ESLint during build for faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const withBundleAnalyzerConfig = withBundleAnalyzer(nextConfig);

const optimizedNextConfig = {
  ...withBundleAnalyzerConfig,
  swcMinify: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    ...withBundleAnalyzerConfig.experimental,
    optimizePackageImports: ['huggingface'],
  },
};

module.exports = optimizedNextConfig;

const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Webpack configuration for path aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/app': path.resolve(__dirname, 'src/app'),
      '@/components': path.resolve(__dirname, 'src/components')
    };
    return config;
  },
  // Compiler configuration for SWC
  compiler: {
    // Enable SWC minification (enabled by default in production)
    // Add any other compiler options here
  }
};

module.exports = nextConfig;

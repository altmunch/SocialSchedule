const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Add experimental features here if needed
  },
  // Add path aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/app': path.resolve(__dirname, 'src/app'),
      '@/components': path.resolve(__dirname, 'src/components')
    };
    return config;
  }
};

// Add Tempo devtools if enabled
if (process.env.NEXT_PUBLIC_TEMPO) {
  nextConfig.experimental = {
    ...nextConfig.experimental,
    swcPlugins: [[require.resolve("tempo-devtools/swc/0.90"), {}]]
  };
}

module.exports = nextConfig;
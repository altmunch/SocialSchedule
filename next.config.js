import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export default nextConfig;
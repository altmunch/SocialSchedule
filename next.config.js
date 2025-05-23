/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Add experimental features here if needed
  },
  // Add any other configurations you need
};

// Add Tempo devtools if enabled
if (process.env.NEXT_PUBLIC_TEMPO) {
  nextConfig.experimental = {
    ...nextConfig.experimental,
    swcPlugins: [[require.resolve("tempo-devtools/swc/0.90"), {}]]
  };
}

module.exports = nextConfig;
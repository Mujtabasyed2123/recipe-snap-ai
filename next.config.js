const path = require('path');

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src'); // Enable @/ alias for src/
    return config;
  },
};

module.exports = nextConfig;

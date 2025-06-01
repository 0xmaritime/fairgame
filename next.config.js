const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig; 
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@bakery/supabase'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;

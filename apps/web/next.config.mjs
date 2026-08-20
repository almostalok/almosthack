/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.BUILD_STANDALONE === 'true' || process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  transpilePackages: [
    '@almosthack/ui',
    '@almosthack/design-system',
    '@almosthack/utils',
    '@almosthack/hooks',
    '@almosthack/types',
  ],
};

export default nextConfig;

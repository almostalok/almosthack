/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@almosthack/ui',
    '@almosthack/design-system',
    '@almosthack/utils',
    '@almosthack/hooks',
    '@almosthack/types',
  ],
};

export default nextConfig;

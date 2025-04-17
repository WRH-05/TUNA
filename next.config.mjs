/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable outputFileTracing for custom server
  output: 'standalone',
  // Allow images from any domain for html2canvas
  images: {
    domains: ['*'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

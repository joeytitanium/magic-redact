/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  devIndicators: {
    appIsrStatus: false,
  },
  images: {
    remotePatterns: [],
  },
  headers: () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'Content-Security-Policy',
          value: "frame-ancestors 'self';",
        },
      ],
    },
  ],
};

export default nextConfig;

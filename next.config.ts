import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';
const isExport = process.env.EXPORT === 'true' || isProduction;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isExport && {
    output: 'export',
    basePath: '/cubing',
  }),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

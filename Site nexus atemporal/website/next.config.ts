import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['nexustemporal.com.br', 'app.nexustemporal.com.br'],
  },
};

export default nextConfig;

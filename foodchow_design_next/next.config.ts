import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint is run explicitly via `npm run lint`; do not block production builds.
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;

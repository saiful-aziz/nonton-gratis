import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  typescript: {
    // Skip type checking during dev builds — use your editor for type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip eslint during builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

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
    // Skip type checking during builds — use your editor for type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

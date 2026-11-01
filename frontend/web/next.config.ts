import type { NextConfig } from "next";

const trpcServerUrl =
  process.env.TRPC_SERVER_URL ?? "http://localhost:3030/trpc";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/trpc/:path*",
        destination: `${trpcServerUrl}/:path*`,
      },
    ];
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  output: "standalone",
  experimental: {
    serverActions: {
      // Post images are uploaded through a Server Action (default limit is 1MB).
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;

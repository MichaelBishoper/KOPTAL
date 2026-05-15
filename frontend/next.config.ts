import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const monolithUrl = process.env.MONOLITH_URL ?? "http://localhost:4000";
    const iamUrl = process.env.IAM_URL ?? "http://localhost:3001";
    return [
      {
        source: "/api/monolith/:path*",
        destination: `${monolithUrl}/api/:path*`,
      },
      {
        source: "/api/iam/:path*",
        destination: `${iamUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

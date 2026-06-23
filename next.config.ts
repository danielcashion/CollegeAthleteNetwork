import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "collegeathletenetwork.s3.us-east-1.amazonaws.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [40, 75],
  },
  compress: true,
  poweredByHeader: false,
};

export default withBotId(nextConfig);

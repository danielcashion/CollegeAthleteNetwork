import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["collegeathletenetwork.s3.us-east-1.amazonaws.com"],
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;

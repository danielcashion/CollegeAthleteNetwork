import type { NextConfig } from "next";

const claimHeaders = [
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Cache-Control", value: "private, no-store" },
];

const nextConfig: NextConfig = {
  images: {
    domains: ["collegeathletenetwork.s3.us-east-1.amazonaws.com"],
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/claim", headers: claimHeaders },
      { source: "/claim/:path*", headers: claimHeaders },
    ];
  },
};

export default nextConfig;

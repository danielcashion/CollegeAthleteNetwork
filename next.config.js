const { withBotId } = require("botid/next/config");

const claimHeaders = [
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Cache-Control", value: "private, no-store" },
];

const noIndexHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const noIndexPaths = [
  "/track-click",
  "/unsubscribe",
  "/surveys/:path*",
  "/media-viewer/:path*",
  "/video-viewer/:path*",
  "/video-viewer-public/:path*",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['collegeathletenetwork.s3.us-east-1.amazonaws.com'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/claim", headers: claimHeaders },
      { source: "/claim/:path*", headers: claimHeaders },
      ...noIndexPaths.map((source) => ({ source, headers: noIndexHeaders })),
    ];
  },
};

module.exports = withBotId(nextConfig); 
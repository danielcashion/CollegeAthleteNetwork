/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['collegeathletenetwork.s3.us-east-1.amazonaws.com'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false
};

module.exports = nextConfig; 
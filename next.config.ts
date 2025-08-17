import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      // Add domains where your cover images might be hosted
      "example.com",
      "images.unsplash.com",
      "cdn.example.com",
      // Add more as needed
    ],
  },
};

export default nextConfig;

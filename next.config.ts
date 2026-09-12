import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // The live store. Without this every next/image pointing at product
      // media throws "hostname is not configured" and takes the page down.
      { protocol: "https", hostname: "cms.thecurioshelf.com" },
      { protocol: "https", hostname: "www.thecurioshelf.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.wp.com" },
    ],
  },
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;

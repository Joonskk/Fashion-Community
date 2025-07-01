import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**", // 모든 경로 허용
      }
    ]
  },
  // 다른 설정들...
};

export default nextConfig;
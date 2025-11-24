import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ React 최적화 옵션
  reactStrictMode: true,
  // ✅ .ts, .tsx 확장자 인식
  pageExtensions: ["ts", "tsx", "js", "jsx"],
};

export default nextConfig;

import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../"),
  async rewrites() {
    return [
      {
        source: "/chat",
        destination: "http://localhost:8080/chat",
      },
      {
        source: "/upload-pdf",
        destination: "http://localhost:8080/upload-pdf",
      },
    ];
  },
};

export default nextConfig;

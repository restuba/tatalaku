import type { NextConfig } from "next";

// Where the web server proxies /api requests to (the backend service).
// Server-side only; falls back to localhost for local development.
const API_PROXY_TARGET = process.env.API_PROXY_TARGET;

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        // Browser calls same-origin /api/* so the auth cookie is set on the
        // web domain (readable by middleware) and there is no cross-site CORS.
        source: "/api/:path*",
        destination: `${API_PROXY_TARGET}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

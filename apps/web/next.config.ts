import type { NextConfig } from "next";

// Where the web server proxies /api requests to (the backend service).
// Server-side only. Falls back to localhost so builds without the env set
// (e.g. CI) still produce a valid rewrite destination instead of "undefined".
const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? "http://localhost:5000";

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

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Old Laravel URLs → new SEO-friendly ones (the target pages redirect again to the full slug).
  async redirects() {
    return [
      { source: "/project/details/:id", destination: "/project/:id", permanent: true },
      { source: "/service/details/:id", destination: "/services/:id", permanent: true },
      { source: "/blog/details/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/blog/cat/list/:id", destination: "/blog", permanent: true },
      { source: "/team/detail/:id", destination: "/team/:id", permanent: true },
      { source: "/management/team/detail/:id", destination: "/team/:id", permanent: true },
      { source: "/career", destination: "/careers", permanent: true },
      { source: "/residence", destination: "/", permanent: true },
      { source: "/engineering", destination: "/", permanent: true },
      { source: "/login", destination: "/admin/login", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        source: "/(frontend|upload)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;

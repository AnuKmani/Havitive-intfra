import type { NextConfig } from "next";

const SUPABASE = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://shybzcfybjhpnxadkdyf.supabase.co").replace(/\/$/, "");

// Content Security Policy: the browser only runs scripts and loads content from the sources listed here.
// 'unsafe-inline' for scripts is required by statically generated Next.js pages (no per-request nonce).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `img-src 'self' data: blob: https: ${SUPABASE}`,
  "media-src 'self' https:",
  `connect-src 'self' ${SUPABASE} ${SUPABASE.replace("https://", "wss://")}`,
  "frame-src https://www.google.com https://maps.google.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Force HTTPS for every request (skipped only for a local test database on plain http).
  ...(SUPABASE.startsWith("https://") ? ["upgrade-insecure-requests"] : []),
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
        headers: SECURITY_HEADERS,
      },
      {
        // The admin is never cached by browsers or shared caches, and never indexed.
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
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

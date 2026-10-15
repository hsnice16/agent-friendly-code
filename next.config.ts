import type { NextConfig } from "next";

// 'unsafe-inline' scripts: Next's hydration payload and the GA init are inline,
// and nonces would need a proxy on every route, which would make the static
// pages dynamic. Production only: `next dev` needs 'unsafe-eval' and an HMR
// websocket, and a policy loosened for dev would test nothing.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.googletagmanager.com",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "img-src 'self' data: https://api.producthunt.com https://peerlist.io https://*.google-analytics.com https://*.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

// lib/db-connection.ts opens data/rank.db via `join(process.cwd(), ...)`, which
// Next.js's static file tracer can't follow — without this, the DB is missing
// from the serverless function bundle on Vercel and /api/repos returns stale data.
//
// The same dynamic `join` / `readdirSync` calls in the scorer and the tree
// materializer make the tracer give up and pull the *entire* project into every
// function bundle. The scorer can't be annotated away — it is vendored verbatim
// into the sibling action and skill repos — so the weight is trimmed here.
const config: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./data/rank.db"],
  },
  outputFileTracingExcludes: {
    "/*": ["./tasks/**", "./tests/**", "./public/**", "./.claude/**", "./.next/cache/**"],
  },

  // Every deployment answers on its *.vercel.app alias as well as the custom
  // domain, serving the same pages. The canonical tag already points home, but
  // a crawler has to fetch the copy to read it; this keeps it out of the index
  // without costing that fetch. The value is an anchored regex over the
  // lowercased hostname, so the custom domain cannot match it.
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: CSP }] : []),
        ],
      },
    ];
  },

  // Crawlers and some clients request /favicon.ico without reading the page's
  // <link rel="icon">, which points at /icon.svg.
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/icon.svg", permanent: true }];
  },

  // `/repo/:id` was the original repo URL, and repos also answer to other
  // casings and former names. Turning those into the stored slug needs a
  // database read, which a static redirect rule can't do, so the request is
  // handed to a route that looks it up and answers 308. `fallback` runs only
  // after the prerendered repo pages have declined the path.
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [{ source: "/repo/:id(\\d+)", destination: "/repo-redirect/:id" }],
      fallback: [{ source: "/repo/:path+", destination: "/repo-redirect/slug/:path+" }],
    };
  },
};

export default config;

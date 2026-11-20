import type { NextConfig } from "next";

import { BOARD_REDIRECTS } from "./lib/board-redirects";
import { APP_HOST, APP_URL } from "./lib/version";

// `noindex` keeps the production alias out of search, but each visit still renders a
// whole page; a 308 renders none. Pages only: README badges and OG images may point at
// this host, and preview deployments answer on other *.vercel.app hosts.
const ALIAS_HOST = "agent-friendly-code.vercel.app";
const ALIAS_REDIRECT =
  APP_HOST === ALIAS_HOST
    ? []
    : [
        {
          source: "/:path((?!api/|og/|_next/).*)",
          has: [{ type: "host" as const, value: ALIAS_HOST.replaceAll(".", "\\.") }],
          destination: `${APP_URL}/:path`,
          permanent: true,
        },
      ];

// 'unsafe-inline' scripts: Next's hydration payload and the GA init are inline,
// and nonces would need a proxy on every route, which would make the static
// pages dynamic. Production only: `next dev` needs 'unsafe-eval' and an HMR
// websocket, and a policy loosened for dev would test nothing.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.clarity.ms https://c.bing.com",
  "img-src 'self' data: https://api.producthunt.com https://peerlist.io https://*.google-analytics.com https://*.googletagmanager.com https://*.clarity.ms https://c.bing.com",
  "style-src 'self' 'unsafe-inline'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

// lib/db-connection.ts opens data/rank.db via `join(process.cwd(), ...)`, which
// Next.js's file tracer can't follow, so the DB would be left out of the Vercel
// bundle and every route that reads it would fail.
//
// The same dynamic `join` / `readdirSync` calls in the scorer and the tree
// materializer make the tracer give up and pull the *entire* project into every
// function bundle. The scorer can't be annotated away — it is vendored verbatim
// into the sibling action and skill repos — so the weight is trimmed here.
const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/*": ["./data/rank.db"],
  },
  outputFileTracingExcludes: {
    "/*": ["./tasks/**", "./tests/**", "./scripts/**", "./*.md", "./public/**", "./.claude/**", "./.next/cache/**"],
  },

  // Previews, and the alias's API and OG routes, still answer on *.vercel.app;
  // noindex drops them without a crawler fetching the canonical. Anchored regex
  // over the lowercased host, so the custom domain can't match.
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
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: CSP }] : []),
        ],
      },
    ];
  },

  // Crawlers and some clients request /favicon.ico without reading the page's
  // <link rel="icon">, which points at /icon.svg.
  async redirects() {
    return [
      { source: "/favicon.ico", destination: "/icon.svg", permanent: true },
      ...ALIAS_REDIRECT,
      ...BOARD_REDIRECTS,
    ];
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

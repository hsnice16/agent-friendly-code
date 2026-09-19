import type { NextConfig } from "next";

// lib/db.ts opens data/rank.db via `join(process.cwd(), ...)`, which Next.js's
// static file tracer can't follow — without this, the DB is missing from the
// serverless function bundle on Vercel and /api/repos returns stale data.
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
    ];
  },

  // `/repo/:id` was the original repo URL. Turning an id back into its slug
  // needs a database read, which a static redirect rule can't do, so the
  // request is handed to a route that looks it up and answers 308.
  async rewrites() {
    return [{ source: "/repo/:id(\\d+)", destination: "/repo-redirect/:id" }];
  },
};

export default config;

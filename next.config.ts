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
};

export default config;

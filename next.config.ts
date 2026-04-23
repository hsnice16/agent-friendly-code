import type { NextConfig } from "next";

// lib/db.ts opens data/rank.db via `join(process.cwd(), ...)`, which Next.js's
// static file tracer can't follow — without this, the DB is missing from the
// serverless function bundle on Vercel and /api/repos returns stale data.
const config: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./data/rank.db"],
  },
};

export default config;

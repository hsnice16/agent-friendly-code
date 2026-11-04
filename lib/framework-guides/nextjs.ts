import type { FrameworkGuide } from "./types";

export const NEXTJS: FrameworkGuide = {
  slug: "nextjs",
  label: "Next.js",
  kind: "app",
  languages: ["TypeScript", "JavaScript"],
  repos: [
    "github/TheOrcDev/8bitcn-ui",
    "github/calcom/cal.diy",
    "github/simstudioai/sim",
    "github/supabase/supabase",
    "github/Significant-Gravitas/AutoGPT",
    "github/payloadcms/payload",
    "github/cline/cline",
    "github/hsnice16/agent-friendly-code",
  ],
  frameworkRepo: "github/vercel/next.js",
  intro:
    "Agents learned Next.js from older versions, so the most useful lines say which version and router you use and what changed. Since 16.3, `next dev` writes a block into AGENTS.md that points agents at the docs bundled in `node_modules/next/dist/docs/`; keep it, and add your own rules around it.",
  commands: [
    { cmd: "next dev", note: "dev server; Turbopack by default since 16" },
    { cmd: "next build", note: "production build; no longer runs the linter" },
    { cmd: "next typegen && tsc --noEmit", note: "type check without a full build" },
    { cmd: "eslint .", note: "lint with ESLint: `next lint` was removed in 16" },
    { cmd: "biome check .", note: "or Biome; name the one you run" },
  ],
  layout: [
    "App Router (`app/`) or Pages Router (`pages/`), and which one new routes go in.",
    'Which files are Client Components: everything a `"use client"` file imports ships to the browser.',
    "In a monorepo, which package holds the Next.js app, and where its own AGENTS.md is.",
  ],
  rules: [
    "`params`, `searchParams`, `cookies()` and `headers()` are async in 16; synchronous access is gone.",
    "`middleware.ts` is now `proxy.ts`, and `proxy` doesn't support the edge runtime.",
    "Only `NEXT_PUBLIC_` variables reach the browser, inlined at build time; `.env*.local` stays out of git.",
    "`revalidateTag` needs a second argument, a `cacheLife` profile.",
  ],
  sources: [
    "https://nextjs.org/docs/app/guides/ai-agents",
    "https://nextjs.org/docs/app/api-reference/cli/next",
    "https://nextjs.org/docs/app/guides/upgrading/version-16",
    "https://nextjs.org/docs/app/guides/environment-variables",
  ],
};

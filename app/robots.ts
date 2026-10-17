import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/version";

const AI_CRAWLERS = [
  "CCBot",
  "GPTBot",
  "YouBot",
  "Diffbot",
  "Amazonbot",
  "ClaudeBot",
  "Cohere-AI",
  "Bytespider",
  "Claude-Web",
  "anthropic-ai",
  "ChatGPT-User",
  "DuckAssistBot",
  "OAI-SearchBot",
  "PerplexityBot",
  "Google-Extended",
  "Perplexity-User",
  "Applebot-Extended",
  "Meta-ExternalAgent",
];

// /score/* is unbounded — one URL per repo that exists anywhere. Filtered
// leaderboard views are deduped with `noindex, follow` instead of a Disallow:
// a blocked URL is one whose canonical and noindex a crawler is never allowed
// to read.
//
// `_rsc` is the payload Next.js fetches when it prefetches a link. Googlebot
// follows those too: they were 94% of its requests here, against 5% for HTML.
const DISALLOW = ["/api/", "/score/", "/*?_rsc=", "/*&_rsc="];

// The home Dataset's `distribution.contentUrl`; the longer rule beats `/api/`.
const ALLOW = ["/", "/api/repos"];

// Petal Search (Huawei) crawls heavily for an engine that sends next to no visitors.
const BLOCKED = ["PetalBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    sitemap: `${APP_URL}/sitemap.xml`,
    rules: [
      { userAgent: "*", allow: ALLOW, disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: ALLOW, disallow: DISALLOW },
      { userAgent: BLOCKED, disallow: "/" },
    ],
  };
}

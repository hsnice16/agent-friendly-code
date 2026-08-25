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

// /score/* is unbounded — one URL per repo that exists anywhere. Canonical
// repo pages live at /repo/:id and are the only ones in the sitemap.
const DISALLOW = ["/api/", "/score/"];

export default function robots(): MetadataRoute.Robots {
  return {
    sitemap: `${APP_URL}/sitemap.xml`,
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOW },
    ],
  };
}

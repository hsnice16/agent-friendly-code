import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/version";

// Fetch a page when someone asks an assistant, or index for its answers: the
// visits that can cite us. The two *-Extended tokens are training opt-outs read
// by crawlers we already admit, so allowing them costs no requests.
const AI_ANSWER_BOTS = [
  "YouBot",
  "Claude-User",
  "ChatGPT-User",
  "DuckAssistBot",
  "OAI-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Google-Extended",
  "Applebot-Extended",
];

// Model training and third-party AI indexes. The guides stay open so models
// learn them; the repo and topic pages cost more origin transfer than they
// return.
const BULK_LIMITED = [
  "CCBot",
  "GPTBot",
  "Diffbot",
  "ShapBot",
  "Amazonbot",
  "ClaudeBot",
  "LinkupBot",
  "Bytespider",
  "ExaSearchBot",
  "Meta-ExternalAgent",
  "cohere-training-data-crawler",
];

// /score/* is unbounded — one URL per repo that exists anywhere. Re-cut board
// URLs aren't disallowed: a blocked URL's canonical is never read.
//
// `_rsc` is the payload Next.js fetches when it prefetches a link. Googlebot
// follows those too: they were 94% of its requests here, against 5% for HTML.
const DISALLOW = ["/api/", "/score/", "/*?_rsc=", "/*&_rsc="];

// A shared Live Score link is only worth sharing with its card, and these
// unfurlers obey robots.txt: a Disallow leaves the post with a bare URL. They
// fetch only what someone pasted, so /score/ costs nothing to open to them.
const LINK_PREVIEW = ["Twitterbot", "LinkedInBot", "facebookexternalhit", "Discordbot", "TelegramBot", "WhatsApp"];
const PREVIEW_DISALLOW = DISALLOW.filter((path) => path !== "/score/");

// The home Dataset's `distribution.contentUrl`; the longer rule beats `/api/`.
const ALLOW = ["/", "/api/repos"];

// Crawl heavily for no visitors: Petal Search (Huawei) and an SEO tool's index.
const BLOCKED = ["PetalBot", "SemrushBot"];

const BULK_DISALLOW = [...DISALLOW, "/repo/", "/topic/"];

export default function robots(): MetadataRoute.Robots {
  return {
    sitemap: `${APP_URL}/sitemap.xml`,
    rules: [
      { userAgent: "*", allow: ALLOW, disallow: DISALLOW },
      { userAgent: AI_ANSWER_BOTS, allow: ALLOW, disallow: DISALLOW },
      { userAgent: LINK_PREVIEW, allow: ALLOW, disallow: PREVIEW_DISALLOW },
      { userAgent: BULK_LIMITED, allow: ALLOW, disallow: BULK_DISALLOW },
      { userAgent: BLOCKED, disallow: "/" },
    ],
  };
}

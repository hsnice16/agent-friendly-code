export const APP_VERSION = "0.9.3";
export const APP_NAME = "Agent Friendly Code";

export const IS_PRE_RELEASE = APP_VERSION.startsWith("0.0.");
export const REPO_URL = "https://github.com/hsnice16/agent-friendly-code";
export const CONTACT_EMAIL = "hsnice16@gmail.com";

const SIBLING_VERSION = "v0";

export const ACTION_REPO_URL = "https://github.com/hsnice16/agent-friendly-action";
export const ACTION_USES = `hsnice16/agent-friendly-action@${SIBLING_VERSION}`;

export const SKILL_REPO_URL = "https://github.com/hsnice16/agent-friendly-skill";
export const SKILL_INSTALL_CMD = `npx skills add hsnice16/agent-friendly-skill#${SIBLING_VERSION}`;
export const SKILL_LISTING_URL = "https://www.skills.sh/hsnice16/agent-friendly-skill/agent-friendly";

// Falling back to the apex, never the *.vercel.app alias: next.config.ts
// serves `X-Robots-Tag: noindex` there, so a missing env var would point
// every canonical and sitemap URL at a host this app tells Google to drop.
// `||`, not `??`: an empty value is set but unusable, and `new URL("")` throws.
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://agentfriendlycode.com";
export const APP_HOST = new URL(APP_URL).host;
export const APP_DESCRIPTION =
  "Scores how ready a repo is for AI coding agents, one score per agent. Ranked public repos, a live score by URL, an agent skill and a GitHub Action.";

export const TWITTER_DEFAULTS = { card: "summary_large_image" } as const;
export const OG_DEFAULTS = { locale: "en_US", siteName: APP_NAME } as const;
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

// Pages that declare their own `openGraph` replace the parent's resolved one,
// which drops the root opengraph-image.tsx that would otherwise cascade. Pages
// with a dedicated image of their own set `images` themselves and win over it.
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  ...OG_IMAGE_SIZE,
  alt: `${APP_NAME} — how ready a repo is for AI coding agents`,
} as const;

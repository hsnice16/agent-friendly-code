export const APP_VERSION = "0.7.0";
export const APP_NAME = "Agent Friendly Code";

export const IS_PRE_RELEASE = APP_VERSION.startsWith("0.0.");
export const REPO_URL = "https://github.com/hsnice16/agent-friendly-code";
export const CONTACT_EMAIL = "hsnice16@gmail.com";

export const SIBLING_VERSION = "v0";

export const ACTION_REPO_URL = "https://github.com/hsnice16/agent-friendly-action";
export const ACTION_USES = `hsnice16/agent-friendly-action@${SIBLING_VERSION}`;

export const SKILL_REPO_URL = "https://github.com/hsnice16/agent-friendly-skill";
export const SKILL_INSTALL_CMD = `npx skills add hsnice16/agent-friendly-skill#${SIBLING_VERSION}`;

// Falling back to the apex, never the *.vercel.app alias: next.config.ts
// serves `X-Robots-Tag: noindex` there, so a missing env var would point
// every canonical and sitemap URL at a host this app tells Google to drop.
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://agentfriendlycode.com";
export const APP_DESCRIPTION =
  "Public dashboard ranking open-source repos by how friendly they are to AI coding agents (Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Kimi CLI, Aider, OpenHands, Pi) — per model, across GitHub, GitLab, and Bitbucket.";

export const TWITTER_DEFAULTS = { card: "summary_large_image" } as const;
export const OG_DEFAULTS = { locale: "en_US", siteName: APP_NAME } as const;
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

// Pages that declare their own `openGraph` replace the parent's resolved one,
// which drops the root opengraph-image.tsx that would otherwise cascade. Pages
// with a dedicated image of their own set `images` themselves and win over it.
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  ...OG_IMAGE_SIZE,
  alt: `${APP_NAME} — AI coding agent friendliness leaderboard`,
} as const;

export const APP_KEYWORDS = [
  "ai",
  "code",
  "agent",
  "codex",
  "devin",
  "claude",
  "cursor",
  "devin ai",
  "friendly",
  "cursor ai",
  "claude code",
  "gpt-5 codex",
  "openai codex",
  "ai code agent",
  "agent friendly",
  "ai code agents",
  "ai coding agent",
  "ai coding agents",
  "ai friendly code",
  "coding assistant",
  "agent friendly code",
  "agent friendly repo",
  "ai pair programming",
  "ai software engineer",
  "pi",
  "aider",
  "gemini",
  "github",
  "gitlab",
  "bitbucket",
  "AGENTS.md",
  "CLAUDE.md",
  "openhands",
  "gemini cli",
  "kimi",
  "kimi cli",
  "kimi code",
  "open source",
  "repo ranking",
  "agent readiness",
  "developer tools",
  "agent ready repo",
  "gemini code assist",
  "v0",
  "amp",
  "cline",
  "codeium",
  "copilot",
  "lovable",
  "tabnine",
  "bolt.new",
  "roo code",
  "windsurf",
  "continue.dev",
  "replit agent",
  "copilot agent",
  "github copilot",
  "sourcegraph amp",
  "copilot agent mode",
  "MCP",
  "spec kit",
  "claude agent sdk",
  "model context protocol",
  "spec-driven development",
  "agentic",
  "agentic ai",
  "agentic ide",
  "agentic coding",
  "ai code editor",
  "ai code review",
  "ai code generation",
  "ai developer tools",
  "ai pair programmer",
  "swe agent",
  "vibe coding",
  "background agent",
  "ai software development",
  "autonomous coding agent",
  "autonomous developer agent",
  "agent eval",
  "ai readiness",
  "ai ready repo",
  "agent benchmark",
  "agent leaderboard",
  "ai ready codebase",
  "agent friendliness",
  "ai agent benchmark",
  "agent compatibility",
  "ai agent leaderboard",
  "pr score check",
  "agents.md ci check",
  "agent friendly action",
  "ai readiness github action",
  "agent skill",
  "codex skill",
  "cursor skill",
  "vercel skills",
  "claude code skill",
  "agent friendly skill",
  "GEMINI.md",
  ".cursor/rules",
  ".aider.conf.yml",
  ".openhands/setup.sh",
  "ai ide",
  "OpenAI",
  "Anthropic",
  "Anysphere",
  "Cognition",
  "agentic ide",
  "code agent ranking",
  "context engineering",
  "ai coding leaderboard",
  "ai friendly repository",
  "claude code leaderboard",
  "agent compatibility score",
  "devin leaderboard",
  "codex leaderboard",
  "agent ready check",
  "ai readiness check",
  "cursor leaderboard",
  "make repo ai friendly",
  "ai code agent comparison",
  "ai pair programmer leaderboard",
];

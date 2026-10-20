import type { Metadata } from "next";

import { SIGNALS } from "./scoring/signals";
import { MODELS } from "./scoring/weights";
import { UNKNOWN_LANGUAGE } from "./utils/language";
import { fitDescription, pageTitle } from "./utils/page-title";
import { APP_NAME, DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "./version";

type Copy = { title: string; description: string; type: "website" | "article" };

// One table so tests/page-meta.test.ts can hold every static page to the
// search-result limits and to unique titles. Pages with data in their title
// (boards, hubs, checks, examples) build theirs where the data is.
export const PAGE_COPY = {
  "/about": {
    title: "About",
    description: `Who built ${APP_NAME}, why, how repos are chosen, and what it is not. Independent, MIT-licensed, and not tied to any AI agent company.`,
    type: "article",
  },
  "/methodology": {
    title: "Scoring methodology",
    description:
      "How we score repos: the checks we run, how much each AI agent cares about each check, the formula, and what we don't measure yet.",
    type: "article",
  },
  "/agents": {
    title: "Which files does each AI coding agent read?",
    description:
      "AGENTS.md, CLAUDE.md, GEMINI.md or .cursor/rules: the repo files Claude Code, Codex, Cursor, Gemini CLI and other agents read, per their docs.",
    type: "article",
  },
  "/check": {
    title: `Agent-ready codebase checklist: ${SIGNALS.length} checks, pass rates`,
    description: fitDescription(
      `What makes a codebase ready for AI coding agents: the ${SIGNALS.length} checks behind every score, from AGENTS.md to tests, CI and dev setup.`,
      "How many popular repos pass each.",
    ),
    type: "website",
  },
  "/score": {
    title: "Is your repo ready for AI coding agents? Free check",
    description:
      "Paste a public GitHub repo URL to see if it is ready for AI coding agents: a score per agent, the one it is best set up for, and what to fix first.",
    type: "website",
  },
  "/language": {
    title: "Agent-friendly repos by language",
    description:
      "Browse the leaderboard by programming language: TypeScript, Python, Rust, Go, Java and more, each ranked for AI coding agents like Claude Code and Cursor.",
    type: "website",
  },
  "/topics": {
    title: "Agent-friendly repos by topic",
    description:
      "Browse the leaderboard by topic: AI, CLI tools, databases, React and more, each ranked for AI coding agents like Claude Code and Cursor.",
    type: "website",
  },
  "/changelog": {
    title: "Changelog",
    description: `What each release of ${APP_NAME} shipped: the user-facing changes, newest first, from the first public release on.`,
    type: "article",
  },
  "/roadmap": {
    title: "Roadmap",
    description:
      "What's next for Agent Friendly Code: maintainers claiming or opting out their repo, packages at scale, many more GitHub repos, and weights from real tests.",
    type: "article",
  },
  "/privacy": {
    title: "Privacy Policy",
    description: `How ${APP_NAME} handles visitor data: what we collect, what we don't, the third-party services we embed, and how to contact us about your data.`,
    type: "article",
  },
  "/terms": {
    title: "Terms of Use",
    description: `Terms of Use for ${APP_NAME}: what the Service is, how you may use it, the limits of the scoring data, and the operator's disclaimers.`,
    type: "article",
  },
  "/package": {
    title: "Packages",
    description: "Look up an npm, PyPI, or Cargo package to see how ready its source repo is for AI coding agents.",
    type: "website",
  },
  "/skill": {
    title: "Agent Skill: score the repo you're in",
    description: `An agent skill that scores the repo you're in for ${MODELS.length} coding agents, shows which one it is best set up for, and suggests a model class. Runs locally.`,
    type: "article",
  },
  "/action": {
    title: "GitHub Action: AI agent readiness check on every PR",
    description:
      "A GitHub Action that checks AI agent readiness on every pull request and comments with how it moves the score for each coding agent. Runs only in your CI.",
    type: "article",
  },
} as const satisfies Record<string, Copy>;

type StaticPath = keyof typeof PAGE_COPY;

type Image = { url: string; width: number; height: number; alt: string };

export function staticPageMetadata(path: StaticPath, image: Image = DEFAULT_OG_IMAGE): Metadata {
  const { title, description, type } = PAGE_COPY[path];
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: path },
    twitter: { ...TWITTER_DEFAULTS, images: [image], title, description },
    openGraph: { ...OG_DEFAULTS, images: [image], title, description, url: path, type },
  };
}

// Not in PAGE_COPY: the page sits under the dynamic /check/[slug] segment.
export const AGENTS_VS_CLAUDE_MD = {
  title: "AGENTS.md vs CLAUDE.md: which one should you use?",
  description:
    "Use AGENTS.md, plus a CLAUDE.md that imports it if you use Claude Code. Which agents read each file, and what Claude Code does when a repo has both.",
} as const;

export const OTHER_LANGUAGES_TITLE = "Agent-friendly repos in other languages";

/** Names the largest of the small languages, so the snippet says what the page holds. */
export function otherLanguagesDescription(groups: { slug: string; label: string; rows: unknown[] }[]): string {
  const repos = groups.reduce((n, g) => n + g.rows.length, 0);
  const named = groups.filter((g) => g.slug !== UNKNOWN_LANGUAGE.slug).map((g) => g.label);
  return fitDescription(
    `${repos} repos in languages too small for their own hub, or with no detected language, ranked for AI coding agents.`,
    ...(named.length > 0 ? [`Includes ${named.slice(0, 3).join(", ")} and more.`] : []),
  );
}

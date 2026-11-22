import type { FaqItem } from "@/components/FaqSection";
import { SIGNALS } from "@/lib/scoring/signals";
import { GENERATOR_PATH } from "@/lib/utils/generator-path";

export const SCORE_FAQ: FaqItem[] = [
  {
    q: "What does the agent readiness check look at?",
    a: `The code repository, not a website or a deployed app: AGENTS.md and the other files agents read, tests, CI, linter and type config, dev setup and the rest of the ${SIGNALS.length} checks. Each is weighted by how much each agent relies on it.`,
    link: { phrase: `${SIGNALS.length} checks`, href: "/check" },
  },
  {
    q: "Is it free? Do I need an account?",
    a: "Free, with no signup and no account.",
  },
  {
    q: "Can it write an AGENTS.md for my repo?",
    a: "If the repo has none, the result includes a starter AGENTS.md drafted from the files the checks found, commands left for you to fill in. More on the AGENTS.md generator.",
    link: { phrase: "AGENTS.md generator", href: GENERATOR_PATH },
  },
  {
    q: "Which AI coding agent should I use for my codebase?",
    a: "This page tells you which agent your repo is best set up for, not which writes the best code. Each agent reads different files (Claude Code loads CLAUDE.md, Cursor its rules files), so you get a score and fixes for each.",
  },
  {
    q: "Does the repo have to be on the leaderboard?",
    a: "No. Any public GitHub repo is scored right away. One already on the leaderboard opens its page, which also shows how the score changed since the last rescore.",
  },
  {
    q: "Is this score different from the leaderboard score?",
    a: "No. Same checks, same weights. The leaderboard clones each repo daily; this page rebuilds it from GitHub's file list, and a test checks both give the same numbers.",
  },
  {
    q: "Do you save or list my repo anywhere?",
    a: "No. The result is cached for up to an hour, then dropped. Nothing goes into our database or onto the leaderboard, and search engines are told not to index it. Your list of scored repos stays in your browser.",
  },
  {
    q: "How up to date is the score?",
    a: "It scores the latest commit and shows which one. Results are cached for an hour, so a very recent push may not show yet.",
  },
  {
    q: "Does it work on private repos, GitLab, or Bitbucket?",
    a: "Live Score scores public GitHub repos. A GitLab or Bitbucket repo already on the leaderboard opens its page, scored the same way; others are held back by API limits: GitLab returns 100 items per request, Bitbucket allows 60 requests an hour without a login. Private repos would need access we choose not to ask for; run the agent skill locally instead.",
    link: { phrase: "the agent skill", href: "/skill" },
  },
  {
    q: "Why won't a very large repo get a score?",
    a: "Past 150,000 files and folders, rebuilding a repo takes longer than a page may run, so we say so rather than give a partial score. The agent skill scores it locally, with no size limit.",
    link: { phrase: "The agent skill", href: "/skill" },
  },
];

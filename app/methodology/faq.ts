import { agentList } from "@/lib/utils/agent-list";

export const METHODOLOGY_FAQ = [
  {
    q: "How is the score worked out?",
    a: "We fetch the latest version of each repo (no history) and run sixteen checks. Twelve matter to every agent: AGENTS.md / CLAUDE.md, CI, tests, README, linter, type config, license, contributing guide, a reproducible dev setup, pre-commit hooks, a dependency list, and codebase size. Four are files only one agent reads: `.cursor/rules/*.mdc`, `GEMINI.md`, `.openhands/setup.sh`, and `.aider.conf.yml`. Each agent's score is the weighted share of checks passed; the overall score is the average across agents.",
  },
  {
    q: "Why give each agent its own score?",
    a: "Because each agent's docs name different files. Claude Code loads CLAUDE.md every session and GPT-5 Codex reads AGENTS.md before any work, so that file counts most for them. Devin works in its own machine, so a runnable dev setup counts more than CI. Cursor reads `.cursor/rules/` and AGENTS.md. One number would hide that a repo can suit one agent and not another.",
  },
  {
    q: "Which AI coding agents do you score for?",
    a: `${agentList()}. Each has its own set of weights, in lib/scoring/weights.ts.`,
  },
  {
    q: "Does this test how well agents actually work?",
    a: "No. Scores come from file checks; no agent is run. The weights follow each agent's docs but aren't yet measured against real runs, so treat scores as a guide.",
  },
  {
    q: "How can I raise my repo's score?",
    a: "Add an AGENTS.md or CLAUDE.md that explains the project, runnable tests, CI, a detailed README, linter and type config, a license, a CONTRIBUTING guide, and a one-command dev setup (devcontainer, Dockerfile or Makefile). Each repo's page lists the fixes that help each agent most.",
  },
  {
    q: "How do I stop pull requests from lowering my score?",
    a: "Install the GitHub Action (hsnice16/agent-friendly-action). It scores each pull request against its target branch in your CI and posts one comment with what changed. An AGENTS_BADGE_TOKEN secret turns it on; every GitHub repo's page has the workflow to copy.",
  },
  {
    q: "What is AGENTS.md or CLAUDE.md?",
    a: "A markdown file at the repo root that tells an AI coding agent what the project is, how to build and test it, and which rules to follow. It is the top check for Pi and Kimi CLI, ties with tests for Claude Code, and helps every other agent.",
  },
  {
    q: "How often are scores updated?",
    a: "Every six hours, and whenever the repo list or the scoring rules change.",
  },
  {
    q: "Which code hosts are supported?",
    a: "GitHub, GitLab and Bitbucket on the leaderboard, all scored the same way. Live Score takes public GitHub repos for now.",
  },
];

export type ChangelogEntry = {
  date: string;
  label: string;
  title: string;
  /** User-facing capabilities shipped in this release, newest-first. */
  highlights: string[];
};

/**
 * Changelog = what's new for *users of the dashboard*. Every bullet should
 * describe something a visitor can see, click, or programmatically call.
 *
 * What does NOT go here:
 * - Codebase hygiene (CI, linters, pre-commit hooks, test infra).
 * - Pure internal refactors, dep bumps, UI polish.
 * - Contributor / maintainer concerns (CONTRIBUTING, PR templates).
 *
 * Those are captured in `tasks/` and the PR description; they don't earn a
 * changelog line.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    label: "0.2.0",
    date: "2026-04-24",
    title: "Complete the dogfood",
    highlights: [
      "This project scores ≥90 on its own rubric — overall 90.6, with each per-model score within 3 pts of the overall.",
      "Leaderboard rows are fully clickable — click anywhere in a row to open the repo detail page (the external open link still goes to the host).",
      "Curated set expanded ~5× — ~125 repos now ranked across JS/TS, Python, Rust, Go, JVM, C/C++, Swift, Ruby, Dart, language runtimes, AI-native models, and coding agents (up from ~25 at 0.1.0).",
      "Desktop leaderboard shows 32 rows per page (mobile keeps 16), with pagination moved below the list so the toolbar stays clean.",
      "Floating back-to-top button appears in the bottom-right when you're near the end of a long page.",
      "Leaderboard footer shows the total number of tracked repos and when they were last scored.",
    ],
  },
  {
    label: "0.1.0",
    date: "2026-04-22",
    title: "First public release",
    highlights: [
      "Public leaderboard ranking open-source repos by agent-friendliness across GitHub, GitLab, and Bitbucket.",
      "Per-model scoring — separate ranking for Claude Code, Cursor, Devin, and GPT-5 Codex, each with its own signal weights.",
      "Repo detail page — score breakdown per signal and the top improvements ranked by score-gain for the selected model.",
      "Methodology page explaining what's measured today and what isn't.",
      "Leaderboard controls — live search, host filter (GitHub / GitLab / Bitbucket), rank + stars sort, paginated results.",
      "Light + dark theme that follows the OS preference; mobile-friendly layout down to 320-px viewports.",
      "JSON API — `GET /api/repos` and `GET /api/repo/:id` for programmatic access.",
      "MIT licensed — free to reuse, adapt, and self-host.",
    ],
  },
];

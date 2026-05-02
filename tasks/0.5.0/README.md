# 0.5.0 — quick wins

**Status**: planned

The cheapest items on the roadmap, paired so they can ship in one cut. History-aware signals extend the existing host-API clients with ~3 new signal files; the PR-diff GitHub Action ships from a sibling repo (`agent-friendly-action`) with the scorer vendored into its bundle, listed on the GitHub Marketplace; the agent skill ships from a second sibling repo (`agent-friendly-skill`) with the same vendored scorer + a portable `SKILL.md`, plus a `/skill` UI integration page on the dashboard. The scorer becomes shared infrastructure across two siblings; we extract it to a standalone package (`agent-friendly-scorer`) when the benchmark harness needs a third consumer.

## Tasks

- [01-history-aware-signals.md](./01-history-aware-signals.md) — extend the scorer with maintenance recency, commit velocity, and contributor activity. Hybrid fetch (shallow clone for files, host API for history) — degrades gracefully without a token.
- [02-score-diff-on-pr.md](./02-score-diff-on-pr.md) — GitHub Action (sibling repo `agent-friendly-action`, Marketplace-listed) that comments the score delta on every PR. Scores base + head locally inside CI; falls back to our DB only if the base fetch fails. Opt-in via `AGENTS_BADGE_TOKEN`.
- [03-agent-skill.md](./03-agent-skill.md) — portable agent skill (installable via `npx skills add` into Claude Code, Codex, Cursor, Cline, Copilot, …) that scores the user's current repo locally with a vendored scorer and recommends a model. Same self-contained property as the action; sibling repo `agent-friendly-skill` ships SKILL.md + an ncc-bundled `dist/index.js`. Adds a `/skill` UI integration page with `SessionStart` hook snippets for agents that support them.

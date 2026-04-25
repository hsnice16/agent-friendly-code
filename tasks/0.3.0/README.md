# 0.3.0 — embeddable scores + broader coverage

**Status**: released (see `lib/changelog.ts` for the user-facing line-up; `lib/version.ts` is pinned at 0.3.0).

Make the current scores usable outside the dashboard (badge SVG for READMEs) and widen the per-model lens with more agents on illustrative weights. Small, shippable steps — the expensive benchmark-harness work moved into the v1.0.0 production cut so it doesn't gate this release.

## Tasks

- [01-badge-endpoint.md](./01-badge-endpoint.md) — `/badge/:host/:owner/:name.svg` so repos can embed their score in a README. **Done.**
- [02-expand-agent-coverage.md](./02-expand-agent-coverage.md) — add Gemini CLI and the next tier of active coding agents to `MODELS` on illustrative weights, tagged clearly on `/methodology`. **Done.**
- [03-animate-score-bar.md](./03-animate-score-bar.md) — animate the `ScoreBar` fill width on leaderboard prev/next instead of remounting. **Done.**
- [04-alternatives-v1.md](./04-alternatives-v1.md) — v1 SQL heuristic for "alternative repos" on the repo detail page. Upgraded to embedding-similarity in 0.5.0. **Done.**
- [05-package-registry-overlay.md](./05-package-registry-overlay.md) — npm / PyPI / Cargo lookup: `/package/:registry/:name` resolves to source repo and surfaces its score, with a pre-filled GitHub issue for anything unscored. Per-registry leaderboards + browser userscript stay in 0.6.0.

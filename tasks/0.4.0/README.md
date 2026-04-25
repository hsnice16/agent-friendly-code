# 0.4.0 — quick wins

**Status**: planned

The cheapest two items on the roadmap, paired so they can ship in one cut. History-aware signals extend the existing host-API clients with ~3 new signal files; the PR-diff GitHub Action is a thin wrapper that calls the badge / API endpoints we already ship. No new infra, no new deps of consequence — high-impact additions that don't need a heavy release.

## Tasks

- [01-history-aware-signals.md](./01-history-aware-signals.md) — extend the scorer with maintenance recency, commit velocity, and contributor activity. Hybrid fetch (shallow clone for files, host API for history) — degrades gracefully without a token.
- [02-score-diff-on-pr.md](./02-score-diff-on-pr.md) — GitHub Action that comments the score delta on every PR using the existing `/api/repo/:id` and `/badge/...svg` endpoints.

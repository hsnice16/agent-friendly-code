# 0.6.0 — auto-refresh

**Status**: released

Keeps the dataset fresh: a 6-hourly GitHub Actions cron re-runs the seed, commits the refreshed `data/rank.db`, and the repo page shows the score delta since the previous rescore. Picks the simplest implementation that delivers the user-facing value rather than the full webhook + queue design originally sketched — see task 01 for the rationale and what was deferred to 0.7.0.

## Tasks

- [01-scheduled-rescoring.md](./01-scheduled-rescoring.md) — keep scores fresh on a 6-hourly GH Actions cron; show overall-score regressions on the repo page. No new infra, no new deps.

## Deferred from this version

- [02-alternatives-v2-embeddings.md](./02-alternatives-v2-embeddings.md) — sentence-transformer embeddings on the README; cosine-similar neighbors as alternatives. Considered for 0.6.0, deferred to backlog on 2026-05-20 — see the task file for the rationale and lighter-weight alternatives.

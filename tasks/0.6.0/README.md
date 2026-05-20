# 0.6.0 — auto-refresh + smarter matching

**Status**: in progress

Two moderate-effort items that shift the product from a manual-seed snapshot to a self-updating dataset with smarter matching. The freshness piece (01) deliberately picks the simplest implementation that delivers the user-facing value (a GH Actions cron) rather than the full webhook + queue design originally sketched — see that task file for the rationale and what was deferred to 0.7.0.

## Tasks

- [01-scheduled-rescoring.md](./01-scheduled-rescoring.md) — keep scores fresh on a 6-hourly GH Actions cron; show overall-score regressions on the repo page. No new infra, no new deps.
- [02-alternatives-v2-embeddings.md](./02-alternatives-v2-embeddings.md) — sentence-transformer embeddings on the README; cosine-similar neighbors = alternatives. Lifts the v1 same-language SQL heuristic so cross-language alternatives surface correctly (e.g. `axios` → `requests`).

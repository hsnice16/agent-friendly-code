# 02 · Alternative recommender (v2) — embedding similarity

**Status**: planned

## Goal

Upgrade the v1 same-language / same-host SQL heuristic (`tasks/0.3.0/04-alternatives-v1.md`) to use **semantic similarity** over README content, so cross-language alternatives surface correctly (e.g. `axios` → `requests`).

## Sketch

- At score time, compute a sentence-transformer embedding over a trimmed README (e.g. `all-MiniLM-L6-v2`, 384-dim, ~23 MB model, CPU-friendly). Store the vector on the `repos` row.
- On the repo detail page, alternatives = top-K cosine-similar repos, filtered by the selected model's score.
- Keep the v1 SQL heuristic as a fallback when there's no embedding yet (e.g. freshly-scored repo mid-run).
- Optional layer: a hand-maintained `alternatives.yml` override for high-confidence curated pairs (e.g. "vite ↔ webpack ↔ parcel") that wins over both heuristics.

## Why this is a separate version

- Adds a dep (`@xenova/transformers` or similar) + CPU-bound work at score time — bigger scope than 0.3.0's "shippable without infra" bar.
- Storage shape changes (new BLOB column on `repos`), so there's a migration.

## Acceptance

- Same-language matches stay similar to v1's output (sanity).
- Cross-language matches appear where semantically warranted (e.g. `axios` returns `requests`, `urllib3`, `got`).
- Embedding model runs in CI / local seed without GPU; score time budget stays under 5s per repo.
- v1 SQL fallback still works when the embedding is missing.

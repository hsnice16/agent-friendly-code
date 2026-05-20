# 02 · Alternative recommender (v2) — embedding similarity

**Status**: deferred

## Why deferred (2026-05-20)

Postponed from 0.6.0 to backlog. Three concrete reasons:

1. **No user-signal demand** — cross-language alternatives (e.g. `axios` → `requests`) sound right in the abstract, but nobody has surfaced the v1 same-language heuristic as a real limitation. Pre-traction is the wrong moment to add ML infra speculatively.
2. **Pre-traction scale undercuts the math** — ~200 repos is too small for cosine over README embeddings to dominate noise (README length / verbosity will partially drive clustering). Signal-to-noise improves materially once `tasks/1.0.0/02-at-scale-indexing.md` lands.
3. **Sibling-bundle risk** — `@xenova/transformers` is ~50 MB. The sibling action + skill vendor `lib/scoring/`, so an embedding dep landing in the wrong place would bloat both `dist/` bundles. A safe placement (e.g. `lib/embeddings/` outside the scoring purity boundary) is doable but not yet justified by the demand picture.

**Cheaper alternatives to consider first**, if alternatives ever come up as a real complaint:

- Hand-curated `alternatives.yml` for the well-known clusters (`axios ↔ requests ↔ got`, `react ↔ vue ↔ svelte`, `vite ↔ webpack ↔ parcel`). High precision, zero deps, an afternoon to seed at this scale.
- GitHub topics overlap (Jaccard on the `topics` array we already fetch). Captures most cross-language cases for free.

Revisit alongside `tasks/0.7.0/02-package-registry-overlay.md` or `tasks/1.0.0/02-at-scale-indexing.md` when repo volume + user feedback justify the dep.

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

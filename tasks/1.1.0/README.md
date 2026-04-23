# 1.1.0 — at-scale GitHub indexing

**Status**: planned

v0.1.0 through v1.0.0 rank a **curated list** (via `scripts/seed.ts`). v1.1.0 flips that: the dashboard discovers and ranks a large slice of public GitHub automatically.

This lands after v1.0.0 because it requires the Postgres migration, the rate-limit primitives, and the tmp-clones disk cap that the production-stability milestone puts in place.

## Tasks

- [01-at-scale-indexing.md](./01-at-scale-indexing.md) — crawl public GitHub (search + trending + submissions), auto-score, surface in the leaderboard.

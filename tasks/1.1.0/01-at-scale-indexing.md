# 01 · At-scale GitHub indexing

**Status**: planned

## Goal

Auto-discover and rank a large slice of public GitHub — not just the curated `scripts/seed.ts` list — so the leaderboard reflects the ecosystem rather than our hand-picked sample.

## Why this is post-1.0

Crawling tens of thousands of repos needs pieces that only land at 1.0:

- **Postgres** for concurrent writers (v1.0.0) — SQLite bottlenecks quickly.
- **Rate-limit primitives** on the public API (flagged in AGENTS.md security section) — if the ingestion workers share infrastructure with the public read path, one pollutes the other.
- **Tmp-clones disk cap** — the cloner runs continuously, not on-demand.

Before 1.0, attempting this wastes effort; after 1.0, the foundation is ready.

## Discovery sources (in order of simplicity)

1. **GitHub search** with filters — `stars:>500`, `pushed:>2026-01-01`, `language:*`. Paginated via `q=…&page=N`. Caps at 1000 results per query; rotate queries by language + star band to sweep breadth.
2. **Trending** (no official API — scrape `github.com/trending` if we care about freshness).
3. **Dependents graph** — once we rank package A, crawl `github.com/<owner>/<repo>/network/dependents` to reach packages that depend on A. Good for ecosystem cohesion.
4. **Explicit submissions** — a `/submit` form where maintainers add their repo. Cheap, zero crawl cost, free marketing.

## Technical constraints

- **GitHub rate limit**: 5000 req/hr per token. Token pool + round-robin to scale. Respect `X-RateLimit-Remaining` + `Retry-After` headers.
- **Clone bandwidth**: `--depth 1 --single-branch` per repo (unchanged). At 50 MB median, 20k repos/day ≈ 1 TB/day. Realistic only on a cloud host with bandwidth-included pricing (Hetzner, Fly, Vercel functions with a worker).
- **Storage**: Postgres row count grows linearly with indexed repos × models × signals. Index-heavy schema; partition by host or by last-scored-at month after ~100k rows.
- **Freshness**: webhook-driven rescoring (v0.4.0) handles pushes on already-indexed repos. The crawler fills in repos we haven't seen yet and re-checks long-dormant ones.

## Scope guard

"All of GitHub" is aspirational. Ship a **target-N, tunable** crawler:

- v1.1.0 delivery: **10k repos** across top-starred + trending + submitted.
- 100k and 1M are throughput questions, not design questions. Leave them to a separate v1.x when we hit them.

## Acceptance

- Crawler indexes ≥ 10k public GitHub repos without exceeding rate limits (verified over a 7-day run).
- Each indexed repo has a non-null score for every model in `lib/scoring/weights.ts`.
- `/api/repos` returns paginated results that include crawler-sourced entries (not only seeds).
- A submitted repo lands in the DB within ≤ 15 minutes of submission.
- Deletion path: if a repo is archived or deleted upstream, next crawl marks it accordingly (don't serve stale rankings).

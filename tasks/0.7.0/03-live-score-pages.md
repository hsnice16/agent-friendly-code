# 03 · Live score pages

**Status**: done

## Goal

Paste a public repo URL, get its score. Same numbers as the leaderboard, for repos the leaderboard has never seen, with nothing stored anywhere.

## Scope: GitHub first

Ship GitHub only. GitLab and Bitbucket work (task 01 validated both), but neither is ready for public traffic:

- **GitLab** paginates its tree at 100 entries. graphviz needs 35 sequential calls; `gitlab-org/gitlab` exceeded 20 minutes and never completed. Needs an entry-count guard before it faces a user.
- **Bitbucket** allows 60 API requests/hour unauthenticated — exhausted by a handful of scores. Needs an app password.

Both render as "support coming" on the entry page. A missing host beats a wrong score, and a hung request beats neither.

## Approach

**A page, not an API route.** `app/score/[host]/[owner]/[name]/page.tsx` as a server component calling the materializer + `scoreRepo` directly. A route handler with `Cache-Control` caches repeats but gives no request coalescing — a thousand simultaneous hits on one uncached repo become a thousand cold scores. Path segments rather than a query string, so the URL is cacheable, shareable and readable.

*Corrected after shipping:* this was built as segment-level ISR (`export const revalidate = 3600`), which does not work here — the page reads `searchParams` for `?model=`, and that makes the route dynamic, so the segment cache never applies and every visit re-scored. The caching is now explicit: `unstable_cache` around `liveScore`, keyed by repo and not by model, since the score is identical across models. A throw is never cached, which is what keeps a rate limit or host blip from being pinned on a repo for the hour — transient failures go to `error.tsx` instead of rendering an apology, while the stable outcomes (too large, no such repo) render and cache.

**No JSON API in v1.** `/api/score` already means the indexed lookup and is a documented contract for external integrators.

**Metadata is cached with the page.** `fetchRepoMeta` runs in `Promise.all` with the tree listing, so it adds no latency, and a cache hit costs no call. This makes `GITHUB_TOKEN` **required** in the Vercel environment: `api.github.com` is 60/hr unauthenticated per IP and serverless egress IPs are shared. Tokenized it is 5,000/hr, far above what the CPU budget allows anyway. `fetchRepoMeta` already returns `null` on failure and callers treat the fields as optional, so a throttled call costs the stars line, never the score.

## Pages

**`/score`** — hero, URL input, submit. Fully static.

*Recents*, max 10: seeded at build time from the leaderboard DB so the list is never empty for a first-time visitor, then replaced by the visitor's own successful scores from `localStorage`. Deliberately not a shared list — that would be the only uncacheable read *and* write on the hot path, and it would publicly broadcast what strangers are scoring.

**`/score/[host]/[owner]/[name]`** — reuses the existing repo-detail components.

| Keep | Drop |
|---|---|
| Slug + host pill | "Use on your repo" band — no badge to embed for an unindexed repo |
| Badge pill — free, `detectBadgeEmbed` only reads the README we already fetch | "Last scored" — meaningless when the page *is* the scoring |
| Stars + default branch — from `fetchRepoMeta` | "Featured" section on the entry page |
| Strengths / Gaps / per-model suggestions / per-model scores | |

"Last scored" becomes `commit <sha7>` — the honest freshness fact for a cached page.

**Already-indexed repos** redirect to `/repo/[id]`: canonical, better SEO, and it absorbs the popular repos that are also the most expensive to score cold.

## Cost

Vercel Hobby's binding resource is **Active CPU, 4 CPU-hours/month**. A cold score is one tree call plus ~4 raw fetches, ~1.5s, almost all of it network wait — which Fluid does not bill. Transfer is not a constraint: responses are a few KB, and the raw fetches count against neither Fast Data Transfer nor Fast Origin Transfer.

Set `maxDuration` explicitly — Hobby defaults to 10s.

Cache hits are served from the edge and never invoke a function, so the ceiling applies only to distinct, uncached repos. Under a stampede of *distinct* repos the cold path must shed load politely rather than melt: reject unparseable URLs before fetching, cap entry counts, and return a plain "at capacity" page rather than a timeout. Per-IP rate limiting needs shared state and is the first thing here that would cost money — add it only if abuse appears.

## SEO

`/score/*` is an unbounded URL space and a crawl trap. `robots.ts` disallows it, the result page sets `robots: { index: false }`, `sitemap.ts` stays limited to `/repo/[id]`, and the redirect above concentrates authority on canonical pages.

`/score` itself is the opposite — a free-tool landing page and the strongest new surface in this release. It carries the full treatment the other tool pages get: keyword-bearing title/description, page keywords, and a JSON-LD `@graph` (BreadcrumbList + WebApplication + FAQPage) backed by a *visible* FAQ, since schema without on-page content is a violation.

## Acceptance

- A GitHub repo not in the leaderboard renders a full score page in one request.
- An indexed repo redirects to `/repo/[id]`.
- Second request for the same repo reuses the cached score without re-listing the tree.
- A GitLab or Bitbucket URL renders a "support coming" state, not an error and not a partial score.
- Score for a given commit matches what `bun run score <url>` produces locally.
- `robots.txt` disallows `/score/`.

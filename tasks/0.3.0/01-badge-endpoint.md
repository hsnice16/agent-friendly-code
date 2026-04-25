# 01 · Badge endpoint

**Status**: done

## Goal

`GET /badge/:host/:owner/:name.svg` → shields.io-style badge with overall (or per-model) score.

## What shipped

- `app/api/badge/[host]/[owner]/[name]/route.ts` — Next.js route handler under `/api/` (consistent with `/api/repos`, `/api/repo/[id]`; `robots.ts` already disallows crawling `/api/*` which is correct for image endpoints). Returns SVG with `Content-Type: image/svg+xml` and `Cache-Control: public, max-age=3600, s-maxage=3600`.
- `lib/utils/badge.ts` — pure SVG generator, hand-rolled (no new deps). Two-segment shields-style layout, tier color from `scoreTier`, neutral fill for "not scored".
- `lib/db.ts` — added `getRepoByHostOwnerName` query (parameterised, lives in `lib/db.ts` per the I/O boundary).
- `components/BadgeEmbed.tsx` — repo-page panel: live preview + copy-paste markdown snippet, links the badge back to the repo's detail page.
- `components/CopySnippet.tsx` — small client island that wraps the snippet with a copy-to-clipboard button. Cursor-pointer, cross-fade (200ms opacity transition) between the `Copy` and `Check` icons on success, 1.5s success state.
- `app/repo/[id]/page.tsx` — renders `BadgeEmbed` after the signal breakdown so visitors discover the badge naturally.
- `README.md` — embeds our own badge near the top (uses `agentfriendlycode.com` as the canonical host).

## Query string

- `?model=claude-code` (or any `ModelId`) — render the per-model score with a `agent friendly · claude code` label.
- No model → overall score, label `agent friendly`.
- Unknown repo → "not scored" badge with neutral grey fill, still 200 OK so README embeds don't show a broken image.

## Verified

- `curl /badge/github/hsnice16/agent-friendly-code.svg` → 200, valid SVG, score 96, green tier.
- `?model=claude-code` returns the per-model variant.
- `/badge/github/nope/does-not-exist.svg` → "not scored" badge.
- Cache headers present.

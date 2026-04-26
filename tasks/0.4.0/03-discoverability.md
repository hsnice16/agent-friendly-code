# 03 · LLM + SEO discoverability surface

**Status**: done

## Goal

Lift the dashboard's discoverability for both human visitors and LLM crawlers. The pieces here are independently small but reinforce each other: an About page gives the methodology a human face (E-E-A-T), `/llms.txt` lets Perplexity / Claude / ChatGPT-search crawlers ingest the dataset cleanly, and per-repo Open Graph images make `/repo/:id` URLs render with a real preview when shared.

Most of this work is already on this branch as uncommitted changes; this task captures scope and acceptance for the release.

## Pieces

### 1. About page (`app/about/page.tsx`)

- Who built this, why, what's in it, what isn't, and how scoring works at a high level (link to `/methodology` for the formula).
- Linked from the footer's secondary nav (`/about` after `/changelog`).
- Static page; same Panel + Tailwind tokens as the rest of the app.

### 2. `/llms.txt` (`app/llms.txt/route.ts`)

- Markdown manifest at the root path `/llms.txt` per the proposed [llms.txt convention](https://llmstxt.org/).
- Lists what the site is, the public API endpoints with one-line descriptions, the methodology page link, and a representative subset of repos (top 20 by overall score).
- `Cache-Control: public, max-age=3600` — same cadence as `/api/repos`.

### 3. Per-repo Open Graph images (`app/repo/[id]/opengraph-image.tsx`)

- `next/og` route convention: every `/repo/:id` page auto-gets an OG image at `/repo/:id/opengraph-image`.
- Image renders the repo's `owner/name`, the overall score, and the score's tier (e.g. "Excellent for AI agents"). 1200×630.
- Wired into Next's metadata pipeline by file location; no manual `metadata.openGraph.images` change needed.

### 4. Robots + sitemap

- `app/robots.ts` — explicit allows for known LLM crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.), still blocking `/api/`.
- `app/sitemap.ts` — include `/about` and `/llms.txt`. Repo entries already there.

## Acceptance

- `/about` reachable from the footer. Renders the same theme tokens as the rest of the app.
- `curl localhost:3000/llms.txt` returns a markdown manifest with at least: site description, primary endpoints, methodology link, top-20 repo list.
- Sharing a `/repo/:id` URL on a chat surface that does OG previews shows a 1200×630 image with the repo + score, not the default `/og.png` site card.
- `app/robots.ts` lists at least 3 known LLM-crawler user agents in `allow:`.
- Type-check + tests pass.

## Out of scope

- A submission form for new packages — keep the existing GitHub-issue contact link.
- Crawler authentication / rate-limit policies for `/api/*` — still blocked at the robots level for LLM crawlers; rate-limiting is operational work for v1.0.0.
- Automatic OG-image regeneration on score updates — Next handles caching; revalidation falls out of normal page revalidation.

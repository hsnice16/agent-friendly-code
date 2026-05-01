---
name: code-review
description: Reviews code changes for repo-specific best practices — Tailwind usage, constants/utils extraction, I/O boundary, React Server Components, and component reuse. Triggers during PR review or after non-trivial edits to app/, components/, or lib/.
---

# Code review — repo best practices

Run through this checklist on any diff. Flag violations with the specific line and the suggested fix.

## Tailwind

- **Prefer utilities over custom classes.** If a pattern can be expressed with existing Tailwind utilities, use them. Don't add a custom class in `app/globals.css` unless the pattern repeats 3+ times with the same composition.
- **Use the `@theme` tokens** (`bg-surface`, `text-ink`, `border-line`, etc.) — never hardcode hex in JSX.
- **No `style={{ ... }}`** unless the value is dynamic (e.g. `width: ${pct}%`). Static styling belongs in className.
- **No `@apply`** in `globals.css` (Tailwind 4 best practice — put the utilities on the element instead, or extract a React component).

## Constants + utils

- Magic numbers → `lib/constants/` (e.g. `SCORE_THRESHOLD_GOOD`, `LEADERBOARD_PAGE_SIZE`).
- Repeated formatting → `lib/utils/format.ts` (`compactStars`, `relativeTime`, `hostLabel`).
- Repeated scoring logic → `lib/utils/score.ts` (`scoreTier`, `TIER_TEXT_CLASS`, `TIER_BG_CLASS`).
- A helper that's used once doesn't belong in `utils/`; inline it.

## I/O boundary (architecturally important)

- **`lib/scoring/` stays pure** — no DB imports, no HTTP, no side effects.
- **All SQL in `lib/db.ts`.** Don't call `db.prepare(...)` from pages or components.
- **Clients in `lib/clients/`** — `git.ts` for cloning, `github.ts` for host APIs.
- Pages and scripts are thin wrappers.

## React Server Components

- **Default to server components.** Only add `"use client"` when you need state, effects, browser APIs, or event handlers.
- **Fetch data in pages**, pass props down. Components don't fetch.
- **Use `<Link>` from `next/link`** for internal navigation, not `<a href>`.
- **Query params over client state** where possible (model filter, pagination, search).

## Components

- If you're writing the same markup 2–3 times, extract a component into `components/`.
- Components are presentational — no data fetching, no side effects.
- Props are typed explicitly; avoid `any`.

## Icons

Only `@phosphor-icons/react`. Block Lucide, Heroicons, React Icons, inline SVG, emoji-as-icon. Import server components from `@phosphor-icons/react/dist/ssr`; client components from the root entry.

## Accessibility (quick pass — delegate deeper checks to `quality-check`)

- Icon-only affordances need `aria-label`.
- Interactive elements are keyboard-reachable.
- No color-only signals (pair color with text or icon).

## Security

- Parameterised SQL only.
- `dangerouslySetInnerHTML` is allowed only for the existing server-built JSON-LD scripts (`app/layout.tsx`, `app/page.tsx`, `app/action/page.tsx`, `app/skill/page.tsx`, `app/methodology/page.tsx`, `app/repo/[id]/page.tsx`, `app/package/[registry]/[name]/page.tsx`) with the `<` → `<` escape preserved. Reject any new use.
- External links include `rel="noopener noreferrer"`.
- Never execute code from a cloned repo.

## Response format when reviewing

Group findings by severity:

- **Must fix**: breaks conventions, security issues, accessibility blockers.
- **Should fix**: best-practice violations, missing extractions.
- **Consider**: minor polish.

Each finding cites the file + line and suggests the exact fix.

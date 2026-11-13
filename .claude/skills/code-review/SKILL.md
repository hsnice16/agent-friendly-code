---
name: code-review
description: Reviews code changes for repo-specific best practices — Tailwind usage, constants/utils extraction, I/O boundary, React Server Components, and component reuse. Triggers during PR review or after non-trivial edits to app/, components/, or lib/.
---

# Code review — repo best practices

Run through this checklist on any diff. Flag violations with the specific line and the suggested fix.

## Tailwind

- **Prefer utilities over custom classes.** A plain-CSS `@utility` in `app/globals.css` only for a class string repeated as AGENTS.md → Conventions allows.
- **Shared UI first** (AGENTS.md → Shared UI): flag a page without `PageHeader`, a hand-styled button, field, table or chip, or a Panel tone used against its meaning.
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
- **All SQL in `lib/db*.ts`.** Don't call `db.prepare(...)` from pages or components.
- **Clients in `lib/clients/`** — git, host and registry APIs.
- Pages and scripts are thin wrappers.

## React Server Components

- **Default to server components.** Only add `"use client"` when you need state, effects, browser APIs, or event handlers.
- **Fetch data in pages**, pass props down. Components don't fetch.
- **Use `<Link>` from `next/link`** for internal navigation, not `<a href>`.
- **Query params over client state** where possible; the boards are the exception (AGENTS.md → Conventions).

## Components

- If you're writing the same markup 2–3 times, extract a component into `components/`.
- Components are presentational — no data fetching, no side effects, except `localStorage` as AGENTS.md → Browser storage allows.
- Props are typed explicitly; avoid `any`.

## Icons

Only `@phosphor-icons/react`. Block Lucide, Heroicons, React Icons, inline SVG, emoji-as-icon. Import server components from `@phosphor-icons/react/dist/ssr`; client components from the root entry.

## Accessibility (quick pass — delegate deeper checks to `quality-check`)

- Icon-only affordances need `aria-label`.
- Interactive elements are keyboard-reachable.
- No color-only signals (pair color with text or icon).

## Security

- Parameterised SQL only.
- `dangerouslySetInnerHTML` only in `components/JsonLd.tsx` (server-built JSON-LD, `<` escaped) and the constant pre-paint script in `components/BoardPendingScript.tsx`. Reject any other use.
- External links include `rel="noopener noreferrer"`.
- Never execute code from a cloned repo.

## Response format when reviewing

Group findings by severity:

- **Must fix**: breaks conventions, security issues, accessibility blockers.
- **Should fix**: best-practice violations, missing extractions.
- **Consider**: minor polish.

Each finding cites the file + line and suggests the exact fix.

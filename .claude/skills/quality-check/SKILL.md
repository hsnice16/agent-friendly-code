---
name: quality-check
description: Reviews code changes against accessibility, responsiveness, performance, and security standards. Triggers on PR review or after non-trivial changes to app/, components/, or lib/.
---

# Quality check — a11y, responsive, performant, secure

Run the four checks below on any diff affecting UI or I/O. Report findings grouped by dimension.

## Accessibility

- **Landmarks**: one `<main>`, one `<h1>` per page, `<nav aria-label>` on every nav.
- **Semantic HTML**: `<button>` for buttons, `<a>` for links, `<form>` for forms. No `<div onClick>`.
- **aria-label** on every icon-only interactive element (hamburger button, external-link icon, medal chips, score bars).
- **Keyboard reachability**: every interactive element is focusable and visibly shows focus. The global `*:focus-visible` ring covers most cases; verify for custom controls.
- **Color contrast AA**: `text-muted` on `bg-surface` and `bg-surface-2` must hit 4.5:1 for body text (3:1 for large). Run the numbers if you change color tokens.
- **Reduced motion**: transitions/animations respect `@media (prefers-reduced-motion: reduce)`.
- **Form labels**: every input has an associated `<label>` (visible or `sr-only`).

## Responsive

- Viewport sizes to verify: **320 px**, **640 px** (sm), **768 px** (md), **1080 px+** (container max).
- **Nav**: collapses to `<MobileNav>` hamburger below md.
- **Tables**: wrapped in `overflow-x-auto` — never force horizontal page scroll.
- **Hero / headings**: scale with `sm:` or `md:` prefix.
- **Grids**: fall back to `grid-cols-1` on narrow.
- **Flex rows** that hold long content: `flex-col sm:flex-row` to stack on mobile.
- **Hero paragraph and body text**: max ~70ch to keep line length readable.

## Performance

- **Server components by default.** Client components only when necessary.
- **Third-party scripts** loaded via `next/script` with `strategy="afterInteractive"` — see `GoogleAnalytics.tsx`.
- **No client-side data fetching** for rendering — use the DB in a Server Component or API route.
- **Image optimisation** via `<Image>` when we add images; no `<img>` unless the src is dynamic and unknown at build.
- **Bundle weight**: flag any new dep > 50 KB gzipped. Justify or use a smaller alternative.
- **Database queries** are `prepare`d once and reused where hot.

## Security

- **SQL parameterisation**: every query uses `?` placeholders. No string concatenation.
- **`dangerouslySetInnerHTML`** is allowed only for server-built JSON-LD (`app/layout.tsx`, `app/page.tsx`, `app/action/page.tsx`, `app/methodology/page.tsx`, `app/repo/[id]/page.tsx`, `app/package/[registry]/[name]/page.tsx`) and must keep the `<` → `<` escape. Any other use must be rejected.
- **External URLs** in `<a target="_blank">` always include `rel="noopener noreferrer"`.
- **User input at every boundary** is validated: `parseRepoUrl` for repo URLs, `Number.isFinite` for numeric params, length caps on search strings.
- **Clone safety**: `git clone --depth 1 --single-branch`; never execute code from a clone (no `bun install`, no `npm install`, no post-clone scripts).
- **Secrets never in code**. `.env.example` documents required vars; `.env.local` is gitignored.
- **Operational concerns** (flag for ops review, not code):
  - Disk cap on the clone workspace.
  - Rate limit on the public API before launch.
  - Sandbox the cloner in a container for production.

## Response format

For each dimension, list:

- **Pass** items (short, one line each).
- **Fail** items with file:line + the fix.
- **Needs manual check** items (e.g. "contrast pass requires a visual check at these two color pairings").

If everything passes, say so plainly. Don't invent issues to look thorough.

# 03 · Animate score-bar width transitions

**Status**: done

## What shipped

- `components/ScoreBar.tsx` — fill div gets `transition-[width] duration-300 ease-out`.
- `app/page.tsx` — leaderboard rows keyed by position instead of repo id so React reuses the `<tr>` (and the nested fill div) across pagination navigations; the width style updates, CSS handles the animation.
- `prefers-reduced-motion` handled globally in `app/globals.css` — no per-component branch needed.
- Verified in the browser: prev/next animates smoothly. Sort / host-filter / model-switch changes also animate as a welcome side effect of position-based keying.

## Changelog

Not added — UI polish per `lib/changelog.ts` policy. Stays in `lib/roadmap.ts` until 0.3.0 cuts.

## Goal

When the leaderboard navigates between pages (`Pagination` prev/next), the colored fill inside `ScoreBar` should **animate its width** to the new value instead of popping in from a fresh mount. Small change, real UX uplift — the eye can track the score delta instead of re-reading every row.

## Sketch

- `components/ScoreBar.tsx` currently renders the fill via inline `style={{ width: "<pct>%" }}`. Two viable approaches:
  1. **CSS transition + stable identity** — add `transition-[width] duration-300 ease-out` to the fill div, and key the row by **position** (not repo id) so React reuses the same DOM node across page navigations; the width style changes, CSS handles the animation. Cheapest path.
  2. **View Transitions API** (Next.js 16's experimental support / cross-document transitions) — name the score-bar element so the browser interpolates it across the navigation. More capable, more surface area.
- Start with (1). Escalate to (2) only if row reuse breaks (e.g. different columns shift in/out).
- Respect `prefers-reduced-motion` — skip the transition entirely under that media query. The animation is a nice-to-have, not a load-bearing signal.

## Acceptance

- Clicking **Next** on `/` with the default 20-per-page view: each row's score-bar fill visibly animates from the old width to the new width over ~300ms; no flash of 0% width.
- Under `prefers-reduced-motion: reduce`, the width changes instantly (no transition).
- No layout shift on the numeric label next to the bar.
- No regression to first-paint of the initial page (transition only applies on client-side navigation).

## Out of scope

- Model-pill switches on the repo page. The user's original ask was about prev/next only; broaden deliberately in a follow-up task if that also feels like it pops.

## Notes

- `ScoreBar` is a server component today; the transition is pure CSS, so it stays server-rendered. No conversion to a client component needed.
- Keep the transition on the **fill**, not on the outer rail — animating the outer width would shift adjacent columns.

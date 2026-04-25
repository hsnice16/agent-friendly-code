# 02 · Package-registry overlay (at scale)

**Status**: planned

## Goal

The v0.3.0 lookup (`tasks/0.3.0/05-package-registry-overlay.md`) answers "is this specific package scored?" on demand. v0.6.0 turns that into a proactive dependency-choice signal: per-registry leaderboards and a browser-side overlay that renders our badge inline on npmjs.com / PyPI / crates.io.

## Scope

- **Per-registry leaderboards** on the dashboard — "top agent-friendly npm / PyPI / Cargo packages". Depends on crawling + scoring popular packages from each registry (feeds into or overlaps the at-scale GitHub indexing in 1.0.0).
- **Browser userscript** (Greasemonkey / Tampermonkey) that reads the current registry page (package name → registry), hits `/api/package/:registry/:name`, and injects the badge near the package title. Userscript first (no store review), browser extension later if adoption warrants it.
- **Monorepo overrides** — a small `overrides.yml` mapping `{ registry, name } → { host, owner, name }` for high-profile packages whose `repository.url` points at a monorepo root or a different host.

## Why this is a separate version

- **Leaderboards** imply crawling; the v0.3.0 lookup is on-demand only and doesn't carry crawler surface area.
- **Userscript distribution** is its own testing / packaging concern (GM manifest, cross-registry DOM probes).
- **Overrides** need a curation process; premature without enough traffic to surface the painful cases.

## Acceptance

- `/leaderboard/:registry` (or similar) renders the top N packages per registry, scored.
- Userscript published to OpenUserJS / Greasyfork renders our badge on the three registry pages for any scored package.
- At least 50 high-profile packages covered (a mix of npm / PyPI / Cargo) either through the crawler or the overrides file.

# 0.10.0 — maintainer ownership + at-scale discovery

**Status**: planned

Two heavier items that depend on real surface-area additions: an OAuth flow with per-user DB writes, and a registry-side discovery surface (per-registry leaderboards + a browser userscript). Bundled because both require new external touchpoints — auth provider sessions, browser extension distribution, registry-page DOM probes — that warrant a single release cut.

Planned for 0.9.0; moved here when 0.9.0 was cut from the discovery and repo-page work that shipped first.

## Tasks

- [01-opt-out-claim-flow.md](./01-opt-out-claim-flow.md) — OAuth so maintainers can claim or opt out of their listing. First touchpoint that writes to the DB on behalf of a user.
- [02-package-registry-overlay.md](./02-package-registry-overlay.md) — per-registry leaderboards on the dashboard + a browser userscript that renders the badge inline on npmjs.com / PyPI / crates.io. Builds on the v0.3.0 lookup endpoint.

## Shipped since 0.9.0, owed a changelog line

- Live Score pages get the repo page's section nav, agent instructions panel, collapsed "All checks" with file links, and the PR Action embed.
- Every page's footer lists every agent board, language, check and topic; the home page's preview cards are gone.
- Visitors from the EEA, UK and Switzerland are asked before Google Analytics sets cookies.

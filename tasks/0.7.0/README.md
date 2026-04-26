# 0.7.0 — maintainer ownership + at-scale discovery

**Status**: planned

Two heavier items that depend on real surface-area additions: an OAuth flow with per-user DB writes, and a registry-side discovery surface (per-registry leaderboards + a browser userscript). Bundled because both require new external touchpoints — auth provider sessions, browser extension distribution, registry-page DOM probes — that warrant a single release cut.

## Tasks

- [01-opt-out-claim-flow.md](./01-opt-out-claim-flow.md) — OAuth so maintainers can claim or opt out of their listing. First touchpoint that writes to the DB on behalf of a user.
- [02-package-registry-overlay.md](./02-package-registry-overlay.md) — at-scale package overlay: per-registry leaderboards on the dashboard + a browser userscript that renders the badge inline on npmjs.com / PyPI / crates.io. Builds on the v0.3.0 lookup endpoint.

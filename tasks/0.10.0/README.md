# 0.10.0 — maintainer ownership + at-scale discovery

**Status**: planned

Two heavier items that depend on real surface-area additions: an OAuth flow with per-user DB writes, and a registry-side discovery surface (per-registry leaderboards + a browser userscript). Bundled because both require new external touchpoints — auth provider sessions, browser extension distribution, registry-page DOM probes — that warrant a single release cut.

Planned for 0.9.0; moved here when 0.9.0 was cut from the discovery and repo-page work that shipped first.

## Tasks

- [01-opt-out-claim-flow.md](./01-opt-out-claim-flow.md) — OAuth so maintainers can claim or opt out of their listing. First touchpoint that writes to the DB on behalf of a user.
- [02-package-registry-overlay.md](./02-package-registry-overlay.md) — per-registry leaderboards on the dashboard + a browser userscript that renders the badge inline on npmjs.com / PyPI / crates.io. Builds on the v0.3.0 lookup endpoint.

## Shipped since 0.9.3, owed a changelog line

- Microsoft Clarity records heatmaps and visits, with typed text masked; visitors from the EEA, UK and Switzerland are asked first, and can change their answer on /privacy. Google Analytics also counts leaderboard searches, filter and sort changes, and "Score your repo" clicks; /privacy says so.
- The leaderboard search keeps what you type while results load, and shows a spinner until they arrive.
- AGENTS.md examples have a page per language (TypeScript, Python, Rust, Go and six more), linked from each language hub.
- Agent leaderboards are titled "Best repos for <agent>", the way people search for them.
- A Live Score of a very large GitHub repo offers a retry when part of its file list fails to load, instead of scoring without those files.

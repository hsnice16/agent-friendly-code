# 0.10.0 — maintainer ownership + at-scale discovery

**Status**: planned

Both items add an external touchpoint — OAuth sessions with per-user DB writes, and a userscript probing registry pages — so they ship in one cut.

## Tasks

- [01-opt-out-claim-flow.md](./01-opt-out-claim-flow.md) — OAuth so maintainers can claim or opt out of their listing. First touchpoint that writes to the DB on behalf of a user.
- [02-package-registry-overlay.md](./02-package-registry-overlay.md) — per-registry leaderboards on the dashboard + a browser userscript that renders the badge inline on npmjs.com / PyPI / crates.io. Builds on the v0.3.0 lookup endpoint.

## Shipped since 0.9.4, owed a changelog line

- The leaderboards have a Badge filter that shows only repos displaying the Agent Friendly Code badge in their README (`?badge=1`).

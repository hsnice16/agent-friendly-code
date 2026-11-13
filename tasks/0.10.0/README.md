# 0.10.0 — maintainer ownership + at-scale discovery

**Status**: planned

Both items add an external touchpoint — OAuth sessions with per-user DB writes, and a userscript probing registry pages — so they ship in one cut.

## Tasks

- [01-opt-out-claim-flow.md](./01-opt-out-claim-flow.md) — OAuth so maintainers can claim or opt out of their listing. First touchpoint that writes to the DB on behalf of a user.
- [02-package-registry-overlay.md](./02-package-registry-overlay.md) — per-registry leaderboards on the dashboard + a browser userscript that renders the badge inline on npmjs.com / PyPI / crates.io. Builds on the v0.3.0 lookup endpoint.

## Shipped since 0.9.4, owed a changelog line

- The leaderboards have a Badge filter that shows only repos displaying the Agent Friendly Code badge in their README (`?badge=1`).
- Repo pages are lighter: "Similar repos" also lists repos sharing the repo's GitHub topics (formerly a separate section), the badge and a link to the GitHub Action share one "Add to your repo" card (on Live Score pages too, in place of the workflow file), and the footer links the language and topic hubs instead of listing each one.
- A package its registry doesn't list now gets a "Package not found" page (404) instead of "no source repo listed", and `/api/package/<registry>/<name>` answers it with `status: "not_found"` and HTTP 404.
- Live Score opens the repo page for a GitLab repo that is already on the board, instead of turning it away.

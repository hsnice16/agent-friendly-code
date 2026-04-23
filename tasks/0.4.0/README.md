# 0.4.0 — ecosystem integration

**Status**: planned

Make the scores usable from outside the dashboard. Badges for READMEs, a PR action that comments the score delta, webhook-driven freshness, and a maintainer opt-out / claim flow.

With 0.3.0's weights now grounded in measurement, these integrations surface the right numbers in the right places.

## Tasks

- [01-badge-endpoint.md](./01-badge-endpoint.md) — `/badge/:host/:owner/:name.svg` for READMEs.
- [02-score-diff-on-pr.md](./02-score-diff-on-pr.md) — GitHub Action that comments score delta on every PR.
- [03-webhook-rescoring.md](./03-webhook-rescoring.md) — keep scores fresh on every push; detect regressions.
- [04-opt-out-claim-flow.md](./04-opt-out-claim-flow.md) — OAuth so maintainers control their listing.

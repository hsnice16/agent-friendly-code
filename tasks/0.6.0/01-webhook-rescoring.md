# 01 · Webhook-driven rescoring

**Status**: planned

## Goal

Scores stay fresh without blanket re-crawling.

## Pieces

- Claimed repos subscribe to push webhooks.
- Webhook → enqueue rescore (rate-limited, content-hash cached).
- Unclaimed repos re-scored on a decay schedule (weekly for top-1000, monthly otherwise).

## Relation to 0.5.0/02 (PR-diff action)

The action is **read-only** and never writes our DB. DB freshness is this task's job. Trigger is `push` to default branch (and optionally `pull_request.merged`) via a GitHub App that listens server-side — maintainers don't need to wire credentials into the action for our DB to refresh.

Two products, one pipeline:

- 0.5.0/02 → comment on PRs (maintainer-facing, runs in their CI).
- 0.6.0/01 → keep our scores fresh (us-facing, runs on our server).

Either product works without the other.

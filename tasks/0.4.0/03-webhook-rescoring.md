# 03 · Webhook-driven rescoring

**Status**: planned

## Goal

Scores stay fresh without blanket re-crawling.

## Pieces

- Claimed repos subscribe to push webhooks.
- Webhook → enqueue rescore (rate-limited, content-hash cached).
- Unclaimed repos re-scored on a decay schedule (weekly for top-1000, monthly otherwise).

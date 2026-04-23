# 0.3.0 — real per-model weights

**Status**: planned

Until now, per-model weights are illustrative — they make the product _shape_ visible, but they aren't grounded in measurement. 0.3.0 closes that gap by actually running agents on scoped tasks per repo and deriving weights from measured success.

This is the foundational step for everything downstream: badges, score diffs on PRs, and the alternative recommender all depend on weights that mean something.

## Tasks

- [01-benchmark-harness.md](./01-benchmark-harness.md) — harness that runs agents on scoped tasks per repo; outputs the per-model weight table consumed by `lib/scoring/weights.ts`.

# 0.7.0 — history-aware signals

**Status**: planned

Today's scorer reads file contents from the working tree at HEAD of the default branch — that's all a `--depth 1 --single-branch` clone gives us. It's the right tradeoff for static-signal scoring (no wasted bandwidth, fast seeding) but leaves time-derived signals on the table.

v0.7.0 closes that gap with a hybrid strategy: keep the shallow clone for file-content signals, supplement with host APIs for history (commits, contributors, release cadence).

## Tasks

- [01-history-aware-signals.md](./01-history-aware-signals.md) — extend the scorer with ≥3 history-based signals, served by the existing host-API clients.

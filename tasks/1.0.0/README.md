# 1.0.0 — production cut

**Status**: planned

The big-rebase release: storage that handles concurrent writers, a dataset that reflects the ecosystem rather than a curated sample, and per-model weights derived from measured agent success instead of illustrative guesses. Bundled because each item changes the product's foundations — storage shape, dataset shape, weight shape — and shipping them together draws a single "1.0" line that downstream API consumers can pin against. From 1.0.0 forward, breaking changes require a MAJOR bump.

Postgres lands first (the others assume concurrent writes the SQLite file can't handle). Benchmark harness sequences last because it needs the full signal set (history-aware signals from 0.5.0) to regress against.

## Tasks

- [01-postgres-migration.md](./01-postgres-migration.md) — leave SQLite behind when concurrent writers arrive.
- [02-at-scale-indexing.md](./02-at-scale-indexing.md) — flip from a curated seed list to an auto-discovered crawl (GitHub search + trending + submissions). Target 10k repos on first delivery.
- [03-benchmark-harness.md](./03-benchmark-harness.md) — actually run agents on scoped tasks per repo; replace illustrative per-model weights with measured ones.

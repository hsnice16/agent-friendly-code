# 1.0.0 — production stability

**Status**: planned

The "1.0" gate is production-readiness: a storage layer that handles concurrent writers, an API we commit to keeping stable, and the operational guard-rails (disk cap on `tmp-clones/`, rate limits, containerised cloner) that the security section of AGENTS.md currently flags as "operational concerns".

From 1.0.0 forward, breaking changes require a MAJOR bump.

## Tasks

- [01-postgres-migration.md](./01-postgres-migration.md) — leave SQLite behind when concurrent writers arrive.

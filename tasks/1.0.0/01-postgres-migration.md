# 01 · Postgres migration

**Status**: planned

## Trigger

When any of these become true:

- Concurrent writers from webhooks/Actions saturate SQLite's single-writer limit.
- Need per-row access control for claimed/private repos.
- Multi-region read replicas required.

## Sketch

- Same schema, adjusted types (SERIAL vs AUTOINCREMENT, etc.).
- `lib/db.ts` pluggable driver: SQLite for local dev / prototype, Postgres for prod.
- Migration tool (drizzle-kit or similar).

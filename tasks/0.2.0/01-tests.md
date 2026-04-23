# 01 · Tests

**Status**: planned

## Scope

Unit tests for the pure parts:

- `lib/scoring/scorer.ts` — `scoreRepo`, `topImprovements`.
- `lib/scoring/signals/*` — each signal against synthetic fixture directories.
- `lib/clients/github.ts` — `parseRepoUrl` for all supported hosts and edge cases (trailing `.git`, `/-/tree/...`, etc.).
- `lib/utils/format.ts` — `compactStars`, `relativeTime`.

## Runner

`bun test` (built-in). No extra deps.

## Acceptance

- `bun test` passes.
- `/tests/` directory exists — flips the `tests` signal to pass=1 for our own repo.
- Fixtures live under `tests/fixtures/`.

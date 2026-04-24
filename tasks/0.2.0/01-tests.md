# 01 · Tests

**Status**: done

## Scope

Unit tests for the pure parts:

- `lib/scoring/scorer.ts` — `scoreRepo`, `topImprovements`.
- `lib/scoring/signals/*` — each signal against synthetic fixture directories.
- `lib/clients/github.ts` — `parseRepoUrl` for all supported hosts and edge cases (trailing `.git`, `/-/tree/...`, etc.).
- `lib/utils/format.ts` — `compactStars`, `relativeTime`.

## Runner

`node --test` (built-in, Node ≥20.9.0) — matches the prod runtime used on Vercel. Switch to `vitest` if we need watch mode + snapshots when the task actually lands.

## Acceptance

- `node --test` passes.
- `/tests/` directory exists — flips the `tests` signal to pass=1 for our own repo.
- Fixtures live under `tests/fixtures/`.

## What shipped

- `tests/` tree with `format.test.ts`, `parse-repo-url.test.ts`, `scorer.test.ts`, and twelve `signals/<id>.test.ts` files.
- `tests/_helpers.ts` — `makeFixture` / `removeFixture` build synthetic directory trees per test under `os.tmpdir()` and tear them down after. Chose programmatic fixtures over a committed `tests/fixtures/` tree so the repo stays small and case-sensitive paths like `.github/workflows/` aren't committed on case-insensitive filesystems.
- `bun run test` → `node --import tsx --test 'tests/**/*.test.ts'` wired in `package.json`. 87 tests pass on Node 22.
- `tests/` directory is now present, so the `tests` signal flips to pass=1 for this repo.

# 0.1.0 — first public release

**Status**: released

Inaugural public release. This folder is the historical record of what shipped; live release notes live in `lib/changelog.ts`.

## Scope

Make the repo presentable and legally-clear for a public reader: license, contributor guide, CI, linter, pre-commit.

## Shipped

- [01-license.md](./01-license.md) — MIT LICENSE at root; `package.json` declares it.
- [02-contributing.md](./02-contributing.md) — CONTRIBUTING.md with branch/commit style, PR template, review bar.
- [03-ci.md](./03-ci.md) — GitHub Actions running Biome + `tsc --noEmit` on every PR.
- [04-linter.md](./04-linter.md) — Biome 2.4 as single linter + formatter.
- [05-pre-commit.md](./05-pre-commit.md) — lefthook `pre-commit`: Biome auto-fix + tsc, parallel.

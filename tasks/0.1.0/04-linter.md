# 04 · Linter / formatter

**Status**: done

## Pick

**Biome** — single tool, zero-config-ish, fast. Replaces the ESLint + Prettier pair.

## What shipped

- `@biomejs/biome@2.4.12` pinned in devDependencies.
- `biome.json` at repo root — formatter + linter + organize-imports on; a few rules relaxed (`noExplicitAny: off`, `noNonNullAssertion: off`).
- `includes` scopes to `app/**`, `components/**`, `lib/**`, `scripts/**` plus root `.ts`/`.tsx`/`.json`.
- Invoked via `bun x @biomejs/biome` (no wrapper scripts in `package.json` — the tool is run directly from CI and the pre-commit hook).
- Wired into CI (task 03) via `bun x @biomejs/biome ci .` and pre-commit (task 05).

## Acceptance

- `bun x @biomejs/biome check .` passes on the current codebase.
- `bun x @biomejs/biome format --write .` applies idempotent fixes.
- Config respects `.gitignore`.

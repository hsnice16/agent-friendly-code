# 05 · Pre-commit hooks

**Status**: done

## Pick

**Lefthook** — single binary, YAML config, language-agnostic. Simpler than husky + lint-staged.

## What shipped

- `lefthook@2.1.6` pinned in devDependencies.
- `lefthook.yml` at repo root with a `pre-commit` step (parallel) running:
  - `bun x @biomejs/biome check --write --no-errors-on-unmatched {staged_files}` on `*.{js,ts,jsx,tsx,json,jsonc,css}` — auto-fixes + `stage_fixed: true` re-stages the formatted files.
  - `bun x tsc --noEmit` on `*.{ts,tsx}`.
- Activation: `bun run prepare-hooks` (wraps `lefthook install`) — documented in CONTRIBUTING.md.

## Acceptance

- `lefthook.yml` committed.
- `bun run prepare-hooks` installs the git hooks locally.
- A new commit with an unformatted file triggers an auto-format and re-stages it.
- The `pre_commit` signal on this repo flips to pass = 1.

# 02 · CONTRIBUTING.md

**Status**: done

## Goal

Explicit contribution workflow.

## What shipped

- `CONTRIBUTING.md` at root covering:
  - Getting started (`bun install` → `bun run prepare-hooks` → `bun run dev`).
  - Branch naming convention (`feat/`, `fix/`, `chore/`, `docs/`, `refactor/`).
  - Commit style (short imperative subject, body only when needed; no hook-skipping).
  - Pre-commit behaviour (Biome auto-fix + `tsc --noEmit`).
  - **PR description template** with required sections: Summary, Motivation, Changes, Testing, Screenshots, Docs+roadmap sync, Risks/rollback.
  - Changelog discipline — append under the current release bucket only when a user-facing capability ships; atomically remove from `lib/roadmap.ts`.
  - Review bar, bug/feature reporting, security contact, code of conduct.

## Acceptance

- `CONTRIBUTING.md` at root. ✓
- Cross-referenced with AGENTS.md (the source of truth); README + AGENTS.md both link to it.

# 02 · Self-score gate

**Status**: planned

## Goal

Confirm this repo hits ≥ 90 overall on its own rubric once `tasks/0.2.0/01-tests.md` lands.

## Steps

1. `bun run score https://github.com/hsnice16/agent-friendly-code` — confirm per-signal breakdown (the repo is already in `scripts/seed.ts`).
2. If a signal fails in an unexpected way, treat it as a bug in the signal — fix the check, not the repo.

## Acceptance

- This repo appears on `/` with overall ≥ 90.
- Every per-model score is within 5 pts of the overall.
- Signals that were previously failing all show pass ≥ 0.9.

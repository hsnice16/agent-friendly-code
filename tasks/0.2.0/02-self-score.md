# 02 · Self-score gate

**Status**: planned

## Goal

Seed this repo into the dashboard and confirm it hits ≥ 90 overall once tasks 01–06 land.

## Steps

1. Add this repo to `scripts/seed.ts` once it's public.
2. `bun run score <repo-url>` — confirm per-signal breakdown.
3. If a signal fails in an unexpected way, treat it as a bug in the signal — fix the check, not the repo.

## Acceptance

- This repo appears on `/` with overall ≥ 90.
- Every per-model score is within 5 pts of the overall.
- Signals that were previously failing all show pass ≥ 0.9.

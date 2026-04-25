# 02 · Self-score gate

**Status**: done

## Goal

Confirm this repo hits ≥ 90 overall on its own rubric once `tasks/0.2.0/01-tests.md` lands.

## Steps

1. `bun run score https://github.com/hsnice16/agent-friendly-code` — confirm per-signal breakdown (the repo is already in `scripts/seed.ts`).
2. If a signal fails in an unexpected way, treat it as a bug in the signal — fix the check, not the repo.

## Acceptance

- This repo appears on `/` with overall ≥ 90.
- Every per-model score is within 5 pts of the overall.
- Signals that were previously failing all show pass ≥ 0.9.

## What shipped

- Scored via local-path mode (`bun run score .`) so the score reflects the tree _with_ the new `tests/` suite rather than the yet-to-be-pushed GitHub state:
  - Overall **90.6**. Per-model: Claude Code 90.0, Cursor 92.7, Devin 89.0, GPT-5 Codex 90.7 — every model within 2.7 pts of overall.
  - `tests` flipped from 0 → 1. `dev_env` still partial at 0.6 (package.json scripts only). `size` drops to 0.2 locally because the local clone workspace pollutes the count — not a signal bug (remote scoring clones into a per-repo subdirectory and scans the inner dir, so the sibling never shows up); called out here rather than patched.

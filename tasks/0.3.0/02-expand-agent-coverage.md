# 02 · Expand agent coverage

**Status**: done

## Goal

Broaden the per-model lens beyond the four originally profiled agents (Claude Code, Cursor, Devin, GPT-5 Codex). Add Google's Gemini CLI first, then the next tier of active coding agents so the leaderboard reflects what the ecosystem actually uses.

## What shipped

- `lib/scoring/weights.ts` — 4 new `ModelProfile` entries, each with weights for every one of the 12 signals (no silent zeros):
  - **Gemini CLI** — long-context, docs- and types-heavy. High `readme` (0.9), high `type_config` (0.9).
  - **Aider** — per-edit test/lint feedback loop. `tests: 1.0`, `linter: 1.0`, `ci: 0.3` (local-first).
  - **OpenHands** (ex-OpenDevin) — sandbox-based autonomy. `dev_env: 1.0`, `ci: 1.0`, `deps_manifest: 1.0`.
  - **Pi** (pi.dev, Mario Zechner) — minimal terminal harness, explicit AGENTS.md reader. `agents_md: 1.0`, lower `dev_env` (0.6) since sandboxing is delegated to extensions.
- `ModelId` union extended; `MODEL_BY_ID` picks up the new ids automatically.
- Methodology page's `tasks/0.3.0/01-benchmark-harness.md` reference updated to `tasks/1.0.0/03-benchmark-harness.md` (harness moved into the production cut).

## Relationship to the benchmark harness (1.0.0)

Real weights will come from the harness (`tasks/1.0.0/03-benchmark-harness.md`). That work is intentionally later because it's expensive. For 0.3.0, the new entries ship with **illustrative** weights — same caveat as the original four models — flagged clearly on the `/methodology` page so no one reads them as measured.

## Acceptance

- ✓ `MODELS` includes Gemini CLI + 3 more (Aider, OpenHands, Pi) — above the task's minimum of "Gemini CLI + at least two more".
- ✓ Each has weights for every signal in `SIGNALS`.
- ✓ Model pills use `flex-wrap gap-2` (`components/ModelPills.tsx`), so they wrap cleanly at 320px — no horizontal overflow.
- ✓ `/methodology` auto-renders the new entries from `MODELS`; weights are explicitly flagged as illustrative until the 1.0.0 harness lands.

## Follow-up

- **Back-fill**: existing repos only have `model_score` rows for the original 4 models. Run `bun run seed` to rescore the curated set so the new pills return non-zero scores for all repos.

# 01 · Documentation-cited agent rationales

**Status**: done

## Goal

Make every per-model rationale defensible against an "okay, where does it say that?" challenge. Today the rationales in `lib/scoring/weights.ts` are claims like "Cursor weighs type configs and a skim-readable README highly." Half of them are unsupported once you read the official docs (Cursor docs don't mention type configs at all; Gemini CLI docs don't mention README weighting; OpenHands user docs don't require a Dockerfile). This task closes that gap and lets `/methodology` drop the "illustrative" hedge that has shipped since 0.3.0.

## Verification findings (do not re-research)

A docs audit run during this conversation produced the per-agent verdicts below. Treat these as the input — the task is to encode them into the codebase, not to redo the research.

| Agent | Verdict | Action |
|---|---|---|
| Claude Code | ✅ supported | Cite `https://code.claude.com/docs/en/memory` — confirms CLAUDE.md is loaded at start of every conversation. |
| Cursor | ⚠️ unsupported | Drop the "type config + README" claim. Real signals are `.cursor/rules/*.mdc` and AGENTS.md. Source: `https://cursor.com/docs/context/rules`. |
| Devin | ⚠️ partial | VM/sandbox is correct; CI emphasis is not. Docs prioritize dev-env setup commands. Source: `https://docs.devin.ai/onboard-devin/repo-setup`. Reweight `ci` from 1.0 → 0.7. |
| GPT-5 Codex | ✅ supported (under-weighted) | Codex is the strictest AGENTS.md adherent — "Codex reads AGENTS.md files before doing any work." Source: `https://developers.openai.com/codex/guides/agents-md`. Lift `agents_md` from 0.7 → 0.9. |
| Gemini CLI | ⚠️ unsupported | "README + types + tests" not in docs. Real signal is hierarchical `GEMINI.md`. Source: `https://geminicli.com/docs/cli/gemini-md/`. |
| Aider | ✅ supported | Auto-lint default-on, auto-test when `--test-cmd` set. Source: `https://aider.chat/docs/usage/lint-test.html`. |
| OpenHands | ⚠️ unsupported | Dockerfile/Makefile not required by user docs. Real signal is `.openhands/setup.sh` + AGENTS.md. Sources: `https://docs.openhands.dev/usage/prompting/repository`, `https://docs.openhands.dev/usage/prompting/microagents-overview`. |
| Pi | ✅ supported | Real tool, AGENTS.md/CLAUDE.md loaded explicitly. Source: `https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/README.md`. |

## Pieces

### 1. New `sources` field on `ModelProfile`

Extend `ModelProfile` in `lib/scoring/weights.ts`:

```ts
export type ModelProfile = {
  id: ModelId;
  label: string;
  rationale: string;
  sources: string[]; // URLs the rationale was derived from
  weights: Record<string, number>;
};
```

Every agent gets at least one URL. Multiple URLs allowed where the claim spans pages (Devin VM + repo-setup; OpenHands microagents + repository docs).

### 2. Rewrite each rationale string

Three rationales are unsupported and must be rewritten (Cursor, Gemini CLI, OpenHands). Two need reweighting (Devin, Codex). Three are accurate but should still cite their source URL (Claude Code, Aider, Pi).

### 3. Reweights

- **Devin** — `ci`: 1.0 → 0.7. Docs emphasize an 8-step machine-setup sequence (deps, secrets, language versions, lint/test commands), not `.github/workflows` files.
- **Cursor** — `agents_md`: 0.6 → 0.8 (Cursor docs explicitly cite AGENTS.md). Lift the still-to-be-added `cursor_rules` to 1.0 in task `02-agent-specific-signals.md`.
- **GPT-5 Codex** — `agents_md`: 0.7 → 0.9. Codex docs say it reads AGENTS.md *before doing any work*; this is the strongest AGENTS.md commitment of any agent.
- **Gemini CLI** — once `gemini_md` signal lands (task 02), weight it at 1.0 on Gemini, 0 elsewhere.

Don't over-tune the others; the verification didn't surface evidence to.

### 4. Methodology page surface

`app/methodology/page.tsx`:

- Replace the "Status: static parameters" warning panel's "illustrative" framing. New copy: "Per-model weights are **derived from each agent's published documentation** — see the Sources panel below for the URLs each claim was sourced from. They are not yet derived from measured agent success; that's the v1.0.0 benchmark harness." Adjusts the FAQ entry that uses "illustrative" the same way.
- Render each `ModelProfile.sources` array under the model's existing rationale block as a list of external links (`rel="noopener noreferrer"` per project security rule).
- The "Models & weight profiles" section already iterates `MODELS`; weights/sources/rationale come along for free.

### 5. Surrounding language

Three other places say "illustrative":

- `AGENTS.md` "Things to leave alone": "Per-model weights are illustrative." → "Per-model weights are derived from each agent's published docs; do not tune individual values without re-running the audit (see `tasks/0.4.0/01-sourced-agent-rationales.md`) or shipping the v1.0.0 benchmark harness."
- `lib/changelog.ts` 0.3.0 entry: "added to the per-model leaderboard with illustrative weights, flagged as such on `/methodology`." Past-tense; leave the historical claim accurate, but the next changelog entry will note the upgrade.
- `tasks/0.3.0/README.md` and `tasks/0.3.0/02-expand-agent-coverage.md`: same — historical, leave alone.

## Acceptance

- `lib/scoring/weights.ts` has a `sources: string[]` field on every model with at least one URL.
- Each agent's rationale string makes a claim that can be checked against the cited URL (no unsourced "we think Cursor likes types").
- Devin's `ci` weight is 0.7; Codex's `agents_md` is 0.9; Cursor's `agents_md` is 0.8.
- `/methodology` no longer says "illustrative"; the Sources panel renders one link list per model.
- `AGENTS.md` "Things to leave alone" line updated.
- `bun run test` and `bun x tsc --noEmit` pass.
- Re-scoring with `bun run seed` does not change scores beyond the expected delta from the four reweighted entries (sanity check — flag anything bigger than ±2 points overall on the dogfood repo).

## Out of scope

- Adding new signals for `.cursor/rules/`, `GEMINI.md`, `.openhands/setup.sh`, `.aider.conf.yml` — that's task `02-agent-specific-signals.md`. Lift the model weights for those signals when that task lands.
- Re-running the docs audit. The verification table above is the source of truth for this release.
- Measured-success calibration — still v1.0.0.

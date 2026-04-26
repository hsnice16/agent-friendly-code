# 02 · Agent-specific instruction-file signals

**Status**: done

## Goal

Detect each agent's *canonical* instruction file beyond AGENTS.md. The docs verification surfaced four files we currently miss but that vendor docs explicitly cite as the agent's primary repo-side input:

| Signal ID | File | Agent | Doc citation |
|---|---|---|---|
| `cursor_rules` | `.cursor/rules/*.mdc` | Cursor | <https://cursor.com/docs/context/rules> |
| `gemini_md` | `GEMINI.md` (any case-insensitive variant) | Gemini CLI | <https://geminicli.com/docs/cli/gemini-md/> |
| `openhands_setup` | `.openhands/setup.sh` | OpenHands | <https://docs.openhands.dev/usage/prompting/repository> |
| `aider_conf` | `.aider.conf.yml` (or `.aider.conf.yaml`) | Aider | <https://aider.chat/docs/config/aider_conf.html> |

Each is a per-agent boost — present on the model that reads it, irrelevant on the others. So weights are the relevant model = high, every other model = 0 (deliberate, not absent — convention in `weights.ts`).

## Pieces

### 1. New signal files

One file per signal under `lib/scoring/signals/`, each implementing the existing `Signal` interface (id, label, description, improveSuggestion, evaluate).

- **`cursor-rules.ts`** — pass = `.cursor/rules/` directory exists and contains ≥ 1 `.mdc` file. Partial credit (0.5) for a single `.cursorrules` legacy file (deprecated by Cursor but still read).
- **`gemini-md.ts`** — pass = case-insensitive `GEMINI.md` at repo root. Length-graded the same way `agents-md.ts` already grades AGENTS.md so a one-line stub doesn't get a free pass.
- **`openhands-setup.ts`** — pass = `.openhands/setup.sh` exists and is non-empty. No need to validate executability (we never run it; agent does, with its own permissions).
- **`aider-conf.ts`** — pass = `.aider.conf.yml` or `.aider.conf.yaml` exists at repo root.

### 2. Register signals

Add each to the `SIGNALS` array in `lib/scoring/signals/index.ts`. Order alphabetically with the existing entries to avoid churn.

### 3. Weight matrix

In `lib/scoring/weights.ts`, add a weight entry for each new signal on **every** model (the `Adding a signal` rule in `AGENTS.md`). The non-target models get explicit `0` so the intent is recorded rather than implicit.

| Signal | Cursor | Gemini CLI | OpenHands | Aider | Others |
|---|---|---|---|---|---|
| `cursor_rules` | 1.0 | 0 | 0 | 0 | 0 |
| `gemini_md` | 0 | 1.0 | 0 | 0 | 0 |
| `openhands_setup` | 0 | 0 | 1.0 | 0 | 0 |
| `aider_conf` | 0 | 0 | 0 | 0.8 | 0 |

(`aider_conf` at 0.8 because Aider can also be configured via CLI flags — the file is the strongest signal but not strictly required.)

### 4. Tests

One `tests/signals/<id>.test.ts` per new signal, mirroring the existing pattern. At minimum: present-and-substantive case, present-but-empty case, absent case.

### 5. Methodology page

The methodology page already iterates `SIGNALS` for the rendered list — new signals appear automatically. No surface change needed beyond the `improveSuggestion` text on each.

## Acceptance

- Four new files under `lib/scoring/signals/`. All registered in `SIGNALS`.
- Every model in `weights.ts` has an entry for each new signal (zeros where intentional).
- Tests for each new signal pass.
- Re-scoring the dogfood repo: Cursor's score drops slightly (we don't ship `.cursor/rules/`), Gemini's score drops similarly, etc. — expected because we don't currently meet our own new bar. Acceptable; the bump-our-own-score work isn't in this task.
- `/methodology` shows the new signals in the Signals list with sensible improve suggestions.

## Out of scope

- Updating the rationale strings — that's task 01. Land 01 first, then this task adds the matching weight rows.
- Hierarchical / nested AGENTS.md detection (Codex feature, valuable but bigger). Park as a follow-up.
- A `cursorrules_modern_only` partial-credit nuance beyond what's listed above.

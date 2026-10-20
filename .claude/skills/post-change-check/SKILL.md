---
name: post-change-check
description: Orchestrates the end-of-turn review after non-trivial edits to app/, components/, lib/, scripts/, or config files. Runs the docs-sync audit, invokes the code-review and quality-check skills on the diff, and flags anything still missing before the turn can close.
---

# Post-change check — docs sync + code review + quality sweep

Run this when a turn has made code changes and you're about to report done. It's the one stop that verifies **the work is coherent** (docs and code aligned) **and correct** (conventions followed).

## When to run

- Auto-invoke yourself when a turn edits any of: `app/**`, `components/**`, `lib/**`, `scripts/**`, `.claude/**`, `lefthook.yml`, `biome.json`, `package.json`, `tsconfig.json`, `next.config.ts`.
- User can also invoke manually: `/post-change-check`.
- **Skip** for pure typo fixes, comment tweaks, or changes entirely inside `tasks/` and `data/`.

## How to run

Work the four phases **in order**. Don't skip ahead — the docs phase often surfaces issues code review won't.

### Phase 1 — Collect the diff

1. `git status --short` — see what moved.
2. `git diff --stat HEAD` — scope.
3. `git diff HEAD -- app/ components/ lib/ scripts/` — the actual changes.

Keep a mental list of: touched files, added/removed exports, new deps, new env vars, new routes.

### Phase 2 — Docs sync audit

For each category below, decide **yes / no / N/A**, then act on the yeses:

- **Changelog line** (rule: AGENTS.md → Versions, changelog, roadmap)
  - Yes only for a user-facing capability. No for hygiene, contributor docs, refactors, dep bumps or UI polish without a semantic change.
  - Action: add a one-line bullet under "Shipped since …, owed a changelog line" in the next version's `tasks/<version>/README.md` (`lib/changelog.ts` gets it when the release is cut), and delete any shipped item from `lib/roadmap.ts`.
- **`lib/roadmap.ts` integrity**
  - Every item must point to a real `tasks/X.Y.Z/NN-*.md` file — no dangling `taskFile` references.
  - Adding a roadmap entry requires adding its task file in the same PR. Don't split.
  - Released versions don't live on the roadmap; they move to `lib/changelog.ts` with a release label.
- **`tasks/X.Y.Z/` files**
  - Yes if scope shifted, a task was partly/fully completed, or a new sub-task emerged.
  - Action: update the file's `**Status**:` header (`planned` / `in_progress` / `done`) and its "What shipped" section.
- **`AGENTS.md`**
  - Yes if stack, directory layout, conventions, or I/O boundary changed.
  - Specifics:
    - Stack changes (Next.js / React / Tailwind / DB driver) → update **Stack**.
    - New top-level folder or `lib/` area → update the **Layout** tree (it lists directories, not every file).
    - New page in `app/` → reachable from the nav, footer or a parent page, and in `app/sitemap.ts` unless noindex.
    - New signal / model / host → ensure the matching "Adding a …" section in `AGENTS.md` is still accurate.
    - New convention or constraint → add a bullet under **Conventions**.
- **`README.md`**
  - Yes if a product-facing behaviour, command, or screenshot changed.
  - Specifics: "Run locally" commands must work; the agent list, signal count and Public API section must match the code.
- **`CONTRIBUTING.md`**
  - Yes if the branch/commit/PR flow or review bar changed.
- **`.env.example`**
  - Yes if a new env var was introduced.
  - Action: document with a one-line comment above the line.
- **`.claude/skills/*`**
  - Yes if a new agent workflow was added or an existing one changed.
  - Action: update or create a skill file.

Report each as `✓ updated`, `✓ N/A — reason`, or `✗ missing — file:line where it should go`.

### Phase 3 — Code review

Invoke the `code-review` skill on the diff and report in its format.

### Phase 4 — Quality sweep

Invoke the `quality-check` skill on the diff and report in its format.

## Output format

Print a single consolidated report:

```
Post-change check — <N> files touched

Docs sync
  ✓ lib/changelog.ts — bullet added
  ✓ N/A — README.md (no product-facing change)
  ✗ tasks/0.2.0/01-tests.md — status still "planned" but harness already committed; flip to in_progress

Code review
  Must fix: <none> | <file:line — why>
  Should fix: …
  Consider: …

Quality
  a11y:  pass
  responsive: pass
  performance: pass — flagged `new-dep@1.2.3` at 73 KB gz, justify or swap
  security: pass

Next steps: <bullet list or "clean, ready to commit">
```

If every phase is clean, say so plainly in one line. Don't invent findings to look thorough.

## What this skill does NOT do

- It does not run tests, biome, or tsc — those are the pre-commit hook's job (`lefthook.yml`).
- It does not push, commit, or open PRs.
- It does not modify the codebase beyond the docs updates in Phase 2 (changelog / tasks / AGENTS / README).

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

- **`lib/changelog.ts` under the current release bucket**
  - Yes **only** if the change ships a user-facing capability (something a dashboard visitor, API caller, or maintainer of a listed repo can observe) **and** that capability maps to a `lib/roadmap.ts` entry or a `tasks/` file whose `Status` just flipped to `done`.
  - No for codebase hygiene (CI, linter, pre-commit, tests), contributor docs (CONTRIBUTING, PR templates), internal refactors, dep bumps, directory moves, or UI polish without a semantic change.
  - Action: append a one-line capability bullet (newest-first) **and** delete the matching item from `lib/roadmap.ts` — moved, not duplicated.
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
    - Stack changes (Next.js / React / Tailwind / Bun / DB driver) → update the **Stack** bullets + cross-check with `README.md`'s Stack & rationale table.
    - New top-level folder → update the **Layout** tree.
    - New page in `app/` → mention in the **Layout** tree and link from the nav in `app/layout.tsx`.
    - New signal / model / host → ensure the matching "Adding a …" section in `AGENTS.md` is still accurate.
    - New convention or constraint → add a bullet under **Conventions**.
- **`README.md`**
  - Yes if a product-facing behaviour, command, or screenshot changed.
  - Specifics: stack changes must match the `AGENTS.md` stack list; quickstart commands must actually work (`bun install`, `bun run prepare-hooks`, `bun run dev`, `bun run score <url>`); prior-art table updated if we've encountered new competitors since last sync.
- **`CONTRIBUTING.md`**
  - Yes if the branch/commit/PR flow or review bar changed, or if the security-contact email moved.
- **`.env.example`**
  - Yes if a new env var was introduced.
  - Action: document with a one-line comment above the line.
- **`.claude/skills/*`**
  - Yes if a new agent workflow was added or an existing one changed.
  - Action: update or create a skill file.

Report each as `✓ updated`, `✓ N/A — reason`, or `✗ missing — file:line where it should go`.

### Phase 3 — Code review

Invoke the `code-review` skill on the diff. Its checklist:

- Tailwind-first (utilities > custom classes, `@theme` tokens > hex, no `@apply` in `globals.css`).
- Constants / utils extracted when the rule-of-three is hit.
- I/O boundary held — `lib/scoring/` stays pure, all SQL in `lib/db.ts`.
- Server components default, client only when interactivity demands it.
- Components presentational — no data fetching, no effects.
- Phosphor icons only.

Report findings in severity order: **Must fix** / **Should fix** / **Consider**.

### Phase 4 — Quality sweep

Invoke the `quality-check` skill on the diff. Four dimensions:

- **Accessibility**: landmarks, aria, contrast, reduced-motion, keyboard reachability.
- **Responsiveness**: 320 → 1080+, mobile nav, table overflow, line-length caps.
- **Performance**: RSC default, `next/script` for third-party, bundle weight, prepared statements.
- **Security**: parameterised SQL, no `dangerouslySetInnerHTML`, `rel="noopener"` on external links, clone safety.

Report Pass / Fail / Needs manual check per dimension.

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

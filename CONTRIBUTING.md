# Contributing

Thanks for considering a contribution. This guide covers the day-to-day: setup, how we name branches and commits, what goes in a PR description, and the review bar.

Read [AGENTS.md](./AGENTS.md) first — it's the source of truth for stack, conventions, and the I/O boundary. AI coding agents and humans are held to the same rules.

## Getting started

```bash
bun install
bun run prepare-hooks   # once — installs lefthook pre-commit (Biome + tsc)
bun run seed            # optional: populate the DB with the curated set (~27 public repos)
bun run dev             # http://localhost:3000
```

## Branch naming

Lowercase, kebab-case, prefixed by intent:

- `feat/<short-name>` — new capability (new signal, page, CLI flag).
- `fix/<short-name>` — bug fix.
- `chore/<short-name>` — tooling, deps, infra (no behaviour change for users).
- `docs/<short-name>` — docs-only.
- `refactor/<short-name>` — internal restructure; no observable change.

Keep it short. `feat/postgres-migration` is better than `feat/add-postgres-migration-for-concurrent-writers`.

## Commit style

One logical change per commit. Short imperative subject (≤72 chars), body only if the change needs explanation.

```txt
Add license signal — scores repos by SPDX ID presence

Reads LICENSE, LICENSE.md, or COPYING at repo root. If `license:` is
present in package.json, count that too. Falls back to 0 on missing.
```

Don't squash-amend published commits. Don't skip hooks (`--no-verify`); if a hook fails, fix the underlying issue.

## Pre-commit hook

`lefthook` runs two jobs on every commit:

1. **Biome** — `check --write` on staged JS/TS/JSON/CSS. Fixes and re-stages.
2. **tsc** — `--noEmit` on `*.{ts,tsx}`. Blocks commits that don't typecheck.

Run `bun run prepare-hooks` once after cloning. CI (`.github/workflows/`) runs the same checks on PR for belt-and-braces.

## PR workflow

Open against `main`. Keep the branch rebased; avoid merge commits from `main` into your branch.

### PR description — required sections

Every PR description must include:

```markdown
## Summary

<1–3 bullets. What changed, in product/capability terms — not a log of work done.>

## Motivation

<Why this change. Link to the roadmap item or `tasks/<file>.md`. If it's
a roadmap item, quote the task's Goal line.>

## Changes

<Bulleted list of what this PR modifies. Keep it scoped to the summary.>

## Testing

<How you verified this. Commands run (`bun run score <url>`, `bun x tsc --noEmit`,
manual pass of specific pages). For UI changes: mobile + desktop, light + dark.>

## Screenshots / screencasts

<Required for any UI change. Drag-and-drop into the GitHub description.>

## Docs + roadmap sync

<Confirm one of:

- "Ships a roadmap item — removed from `lib/roadmap.ts`, added to `lib/changelog.ts` under the current release bucket."
- "N/A — internal refactor / polish; no changelog entry."
  Plus: "AGENTS.md / README.md updated if structure or conventions changed.">

## Risks / rollback

<What could break? How do we roll back? Leave blank if genuinely trivial.>
```

### When to update the changelog

Only when the PR **ships a user-facing capability** — something a dashboard visitor, API caller, or maintainer of a listed repo can observe (new page, new control, new API response field, new signal surfaced in the breakdown, new supported host). It must also map to an item in `lib/roadmap.ts` or to a `tasks/` file flipping to `done`.

Not in the changelog: codebase hygiene (CI, linters, pre-commit, tests), contributor docs, dep bumps, internal refactors, or pure UI polish. Those belong in the task file and this PR description.

When the PR qualifies, move the item atomically: append a one-line capability bullet under the current release bucket in `lib/changelog.ts`, **and** remove the matching entry from `lib/roadmap.ts` in the same PR. If you're in Claude Code, the `post-change-check` skill orchestrates this at the end of your turn — just say "update the changelog" or let it run automatically via the Stop hook.

### Size

PRs under ~400 lines of diff review fastest. If your change is larger, split by feature or by layer (scoring → DB → UI) so each PR is independently reviewable.

## Review bar

A PR is ready to merge when:

1. CI is green (`.github/workflows/`).
2. At least one review with an explicit `LGTM` or equivalent.
3. No unresolved review comments.
4. PR description has all required sections.
5. If the PR ships a roadmap item, the roadmap↔changelog move has happened in the same diff.

## Reporting bugs + requesting features

- **Bugs**: open an issue with repro steps, expected vs actual, and the `bun --version` / Node version you're on.
- **Features**: if it's on the roadmap, say which version. If it's not, propose it in an issue first — we may want to add it to `lib/roadmap.ts` before the PR lands.

## Security

See the "Security / threat surface" section of [AGENTS.md](./AGENTS.md). For vulnerability reports that shouldn't be public, email hsnice16@gmail.com rather than opening an issue.

## Code of conduct

Be decent. Technical disagreement is fine; personal attacks, harassment, and dismissiveness are not. If you wouldn't say it in a work 1:1, don't write it in a review.

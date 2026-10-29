# Contributing

Read [AGENTS.md](./AGENTS.md) first: stack, conventions, the I/O boundary and security rules. People and AI agents follow the same rules.

## Setup

```bash
bun install
bun run prepare-hooks   # once
bun run dev             # http://localhost:3000
bun run test            # Node ≥ 22
```

`data/rank.db` is committed and rewritten on `main` daily by `.github/workflows/scheduled-rescore.yml`. Don't commit a local re-seed unless the change needs it; on a conflict, take `main`'s copy (`git checkout --theirs -- data/rank.db`) and re-seed.

## Changing the seed list

`scripts/seed-list.ts` is the full set of ranked repos. `bun run seed` makes the database match it, so editing the list is the whole change; the next rescore applies it.

- **Add** — append `{ url, note }`.
- **Remove** — delete the entry; its row and scores go. One run deletes at most 10 rows, since a broken list looks like a mass removal; set `SEED_MAX_PRUNE` for a deliberate bulk removal.
- **Rename or transfer** — set `url` to the new address and add the old one to `was: [...]`. The row keeps its id and history, and old page, badge and API URLs keep working. Never drop a `was` entry: READMEs embed the old badge URL.
- **Keep despite an audit finding** — add its kind to `accept`, e.g. `accept: ["archived"]`.

`bun run audit-seeds` runs weekly (`.github/workflows/seed-audit.yml`) and files its findings in one issue labelled `seed-audit`; the job fails until each is fixed or accepted.

## Branches and commits

- Branches: `feat/`, `fix/`, `chore/`, `docs/` or `refactor/` plus a short kebab-case name.
- Commits: one logical change, imperative subject ≤ 72 characters, a body only when the why isn't obvious.
- Never skip hooks (`--no-verify`) or rewrite published commits.

## Checks

Pre-commit (`lefthook.yml`): Biome (fixes and re-stages), `tsc --noEmit`, the test suite, the database leak scan when `data/*.db` is staged, and a 300-line cap on `.ts` / `.tsx` under `app/`, `components/` and `lib/`.

CI (`.github/workflows/ci.yml`) repeats Biome, tsc, tests and the leak scan, and runs a production build. `parity.yml` runs nightly, and `bun run parity-check --pr` when a PR touches the scorer, Live Score or cloning code: it scores real repos both ways and fails if Live Score and the leaderboard disagree. Fix the drift rather than re-running.

## Pull requests

Open against `main` and keep the branch rebased. The description follows [the PR template](./.github/PULL_REQUEST_TEMPLATE.md); UI changes need screenshots at mobile and desktop widths, light and dark. Aim for under ~300 changed lines; split larger work by layer (scoring → DB → UI).

A change earns a changelog line only if a visitor, API caller or listed maintainer can see it. Details: [AGENTS.md → Versions, changelog, roadmap](./AGENTS.md#versions-changelog-roadmap).

Ready to merge when CI is green, a reviewer has approved, no comments are open, and the description is complete.

## Issues

- **Bugs**: steps to reproduce, expected vs actual, Node version.
- **Features**: propose in an issue first; say which roadmap version it fits, if any.
- **Remove my repo**: open an issue with the repo URL.

## Security

See [SECURITY.md](./SECURITY.md). Don't report vulnerabilities in public issues.

## Conduct

Be decent. Disagree about code, not people.

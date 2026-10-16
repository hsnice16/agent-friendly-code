# AGENTS.md

Instructions for AI coding agents working on this repo. `CLAUDE.md` points here. Human contributors: [CONTRIBUTING.md](./CONTRIBUTING.md) has the same rules phrased for PRs.

## What this is

Scores how ready a repo is for AI coding agents, one score per agent (`model` in the code), because the right scaffolding differs between agents. This repo is the website and the canonical scorer; [`agent-friendly-skill`](https://github.com/hsnice16/agent-friendly-skill) and [`agent-friendly-action`](https://github.com/hsnice16/agent-friendly-action) vendor it. Product overview: [README.md](./README.md). Scoring formula: `/methodology` on the running app.

## Stack

Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 4 (`@theme` tokens in `app/globals.css`, no config file), Phosphor Icons (the only icon library), `better-sqlite3` on `data/rank.db`, the `git` CLI for shallow clones. Node ≥ 22 is the runtime (Vercel's serverless runtime, so no Bun-only APIs); Bun is optional as a local package manager. Biome lints and formats; lefthook runs the pre-commit jobs.

## Commands

```bash
bun install
bun run prepare-hooks  # once — lefthook pre-commit: Biome, tsc, tests, db-leaks, file-length
bun run dev            # http://localhost:3000
bun run test           # node --test + tsx
bun x tsc --noEmit
bun run score <url|path>
bun run seed           # reconcile data/rank.db with scripts/seed-list.ts, then rescore every seed
bun run init-db        # optional: migrate an older DB (the schema also applies on open)
bun run audit-seeds    # forks / mirrors / archived / renamed / gone / stale seeds (needs GITHUB_TOKEN)
bun run parity-check   # live-score path must equal `bun run score` (--pr for the PR subset)
bun run check-db-leaks # local paths / tokens in data/rank.db — run before committing it
bun run indexnow       # submit sitemap URLs to IndexNow (--since <ISO time>, --dry-run)
```

Set `RANK_DB_PATH` to work on a copy of the database; `data/rank.db` is rewritten on `main` every six hours.

## Layout

```text
app/          routes: pages, API (app/api), OG images (app/og), robots.ts, sitemap.ts, llms.txt
components/   presentational React components
lib/
  scoring/    signals (one file each), weights.ts (MODELS), scorer.ts — pure, vendored by the siblings
  live-score/ /score/…: host tree API → materialized directory → scoreRepo
  clients/    git clone, host APIs, package registries, language names
  db.ts       the only import path for queries; re-exports the db-*.ts modules (schema in db-schema.ts)
  utils/      URL builders, page titles, formatting, repo-page builders
  check-content/  prose for each /check/<slug> page, keyed by signal id
  version.ts  app and sibling constants (APP_URL, SIBLING_VERSION, install snippets, OG defaults)
  changelog.ts, roadmap.ts  what /changelog and /roadmap render
scripts/      CLI entry points (run with tsx)
tests/        node --test suites; fixtures/repo-meta/ holds recorded host API responses
tasks/        per-version task files
data/rank.db  committed database, refreshed by .github/workflows/scheduled-rescore.yml
```

## I/O boundary

- `lib/scoring/` is pure: it reads the tree it is given, nothing else.
- External I/O lives in `lib/clients/`, `lib/live-score/` and `lib/db*.ts`. All SQL is in `lib/db-*.ts`, parameterised.
- `app/` and `scripts/` are thin wrappers. Components don't fetch; pages fetch and pass props.

## Conventions

- **Exact-pinned deps** (no `^`, no `latest`) — scoring must be deterministic.
- **Server components by default.** Prefer `<Link>` and query params over client state. Exception: repo pages are prerendered, so they never read `?model=`; `ModelSuggestionsSwitch` reads it in the browser.
- **One place per URL shape.** Build repo URLs with `lib/utils/repo-path.ts`, check URLs with `check-path.ts`, board URLs with `leaderboard-href.ts`, links to a file on its host with `repo-file-url.ts`.
- **Page metadata.** Static-page titles and descriptions live in `PAGE_COPY` (`lib/page-meta.ts`); length caps come from `lib/utils/page-title.ts`. Next.js shallow-merges `openGraph` / `twitter`, so a page that sets either re-spreads `OG_DEFAULTS` / `TWITTER_DEFAULTS` and sets an image (`DEFAULT_OG_IMAGE` or its own).
- **Indexing.** Filtered board views are deduped with `noindex,follow` (`lib/leaderboard-meta.ts`), never a robots.txt `Disallow`, which would hide that directive. Package pages are noindex and stay out of the sitemap.
- **Signal IDs** (`agents_md`, `tests`, …) are stable. Renaming one is a migration.
- **Path lookups** in signals go through `firstExisting` / `resolveRelative` / `resolveAllRelative` (`helpers.ts`), never `existsSync(join(…))`. They match case-insensitively (`readme.md`, `README.MD`) so Linux CI and macOS agree, and must not depend on `readdir` order.
- **An empty AGENTS.md / CLAUDE.md** (`agents_md` pass 0.2) does not count as having one wherever a share is shown.
- **Browser storage.** A `"use client"` component may use `localStorage` (no accounts), through a `lib/` helper (`live-score/recents.ts`, `release-notice.ts`) wrapped in try/catch, read after mount so server HTML matches.
- **Tailwind utilities and `@theme` tokens**; no hex in JSX, no static inline styles, no `@apply`.
- **Comments say why, never what.** The shallow-clone note in `lib/clients/git.ts` is the model.
- **File length**: `.ts` / `.tsx` under `app/`, `components/`, `lib/` stay ≤ 300 lines (pre-commit enforced). `scripts/` is exempt.
- **Brand**: "Agent Friendly Code" in UI copy; `agent-friendly-code` as slug and `User-Agent`.
- **Tests that touch the DB** import `tests/_temp-db.ts` before anything that loads `lib/db.ts`, or they open the committed database.

## Versions, changelog, roadmap

- `APP_VERSION` (`lib/version.ts`) and `package.json` `version` change only when cutting a release, together with a new bucket in `lib/changelog.ts`. The number is also hard-coded in the `README.md` release badge and the `SessionStart` hook in `.claude/settings.json`.
- The changelog lists user-facing capabilities only: something a visitor, API caller or listed maintainer can see or call. CI, tests, refactors, dep bumps and contributor docs stay in `tasks/` and the PR.
- When a roadmap item ships, remove it from `lib/roadmap.ts` in the same change. Every roadmap item points at a real `tasks/` file.
- Work since the last release that is owed a changelog line is listed in the next version's `tasks/<version>/README.md`.

## Sibling repos

`../agent-friendly-action/` (PR score-diff Action) and `../agent-friendly-skill/` (agent skill) each vendor `lib/scoring/` into `src/scoring/` and ship one `@vercel/ncc` bundle in `dist/`. The three copies are kept in sync by hand.

**Whenever you change `lib/scoring/`**, in both siblings: copy the changed files (same layout), rebuild `dist/`, and add a line under "Unreleased" in `CHANGELOG.md`. Their CI checks `dist/` against `src/` but cannot see upstream drift. If a sibling is not checked out, say so; never skip it silently.

Both siblings release the same major. `SIBLING_VERSION` in `lib/version.ts` builds `ACTION_USES` and `SKILL_INSTALL_CMD`; the major is also written in `skills-lock.json` (`ref`), `.github/workflows/agent-friendly.yml` (`@v0`) and the `/action` and `/skill` FAQ copy. Change them together, only when both siblings cut a new major.

## Adding a signal

1. Add `lib/scoring/signals/<kebab-id>.ts` implementing `Signal` (with `improveSuggestion`), using the `helpers.ts` resolvers.
2. Register it in `SIGNALS` (`signals/index.ts`) and give it a weight in **every** model in `weights.ts` (missing means 0).
3. Write its `/check/<slug>` prose in `lib/check-content/`, and its panel headings in `questions.ts` there. Its `scoring` lines restate the signal's thresholds by hand; keep them in step.
4. Update the hard-coded signal count in `README.md` and the count and list in `app/llms.txt/route.ts`.
5. Mirror to both siblings (above), then `bun run seed`.

## Adding a model

1. Add a `ModelProfile` to `MODELS` in `weights.ts`, with `sources` and a weight for every signal. Boards, pills, the sitemap, `/methodology` and repo pages pick it up.
2. Update the agent lists that don't derive from `MODELS` (`agentList()`): `app/terms/page.tsx` and `README.md`. Grep the count as a word and a digit and `OpenHands` to find them. `tasks/` and `lib/changelog.ts` are historical; leave them.
3. Existing repos have no `model_score` rows for it until rescored, and every query that joins `model_score` (its board, Live Score's similar repos) returns nothing. Run `scheduled-rescore.yml` via `workflow_dispatch` on deploy. Reweighting a model leaves stored scores stale the same way.
4. Mirror the weights to both siblings.

## Adding a host

1. `parseRepoUrl` in `lib/clients/github.ts`.
2. `fetchRepoMetaOrPrivate`: the host's API (token from `process.env.<HOST>_TOKEN`), language through `canonicalLanguage` / `primaryLanguage`, description and topics through `sanitizeDescription` / `sanitizeTopics`, `"private"` for non-public repos, and a recorded response in `tests/fixtures/repo-meta/`.
3. A seed in `scripts/seed-list.ts`; label and domain in `lib/constants/hosts.ts`.
4. Live Score: URL builders in `lib/live-score/hosts.ts`, a fixture in `scripts/parity-check.ts`, and only once parity is green the id in `SUPPORTED_HOSTS` (`lib/live-score/supported.ts`). `/score/[host]/[owner]/[name]` takes one segment per field, so nested namespaces need a route change.

## Security

- Clones are `git clone --depth 1 --single-branch`, no submodules. Nothing from a clone is ever executed or installed.
- Repo contents are untrusted. The scorer never follows a symlink out of the tree, reads only regular files, and stops at `MAX_READ_BYTES` (1 MiB); the siblings run it on local trees. The materializer writes a placeholder for any link target outside the tree.
- `/score/[host]/[owner]/[name]` turns visitor input into host API calls and a temp directory. The route's `SLUG` regex and `safeAbsolute` in `lib/live-score/materialize.ts` are the guards; `tests/live-score*.test.ts` and `tests/symlink-containment.test.ts` cover them. Never weaken either.
- Private repos are never scored, live or by CLI, even when the token can read them.
- The only `dangerouslySetInnerHTML` is `components/JsonLd.tsx` (server-built JSON-LD, `<` escaped). Owner-written repo descriptions and topics reach it only after `lib/utils/repo-about.ts` sanitises them, and never reach OG images.
- `data/rank.db` is public, freed pages included: `bun run check-db-leaks` must pass before committing it.
- No auth. The only write a request can cause is caching a package → repo alias, off Vercel only, for a name valid on its registry. Auth arrives with `tasks/0.10.0/01-opt-out-claim-flow.md`; gate DB writes per user then.
- Secrets live in env vars only (`.env.example`). The production `GITHUB_TOKEN` must be read-only.
- Not yet done: rate limits on the public API and `/score/*` (an uncached slug spends the shared GitHub quota), and sandboxing the cloner.

## Leave alone

- Per-model weights. Rationales cite each agent's docs (`MODELS[].sources`); values change only with a fresh docs audit or the benchmark harness (`tasks/1.0.0/03-benchmark-harness.md`).
- The SQLite schema's simplicity and the I/O boundary. Flag before restructuring.
- `.claude/skills/agent-friendly/` — installed by `npx skills add hsnice16/agent-friendly-skill#v0 --agent claude-code -y` (pinned in `skills-lock.json`); reinstall, don't edit.

## Claude Code hooks and skills

- `SessionStart` prints the release and the changelog rule.
- `Stop` runs `.claude/hooks/stop-guard.sh`: if watched source paths changed, it blocks once until the `post-change-check` skill has run (docs sync, then `code-review`, then `quality-check`).

## Before you finish

`bun run test`, `bun x tsc --noEmit`, `bun x biome check .`; for scoring changes `bun run score https://github.com/honojs/hono`; for UI changes a pass over the affected pages at mobile and desktop widths, light and dark.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

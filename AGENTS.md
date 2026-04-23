# AGENTS.md

Instructions for AI coding agents (Claude Code, Cursor, Codex, Devin, etc.) working on this repo.

> `CLAUDE.md` is a one-line pointer to this file. AGENTS.md is the cross-agent standard; keeping one source of truth avoids drift.
>
> Human contributors should read [CONTRIBUTING.md](./CONTRIBUTING.md) — same rules, phrased for PR workflow and review.

## What this project is

A public dashboard that ranks open-source repos (GitHub, GitLab, Bitbucket) by how friendly they are to AI coding agents — **per model**, because the right scaffolding differs between Claude Code, Cursor, Devin, and others.

See `README.md` for the full product narrative. See `tasks/` for per-version work breakdown. Visit the app's `/methodology` page for the live scoring formula.

## Stack

- **Next.js 16** (App Router) — web UI + API routes.
- **React 19** — server components by default; no client JS unless interactivity requires it.
- **Node (≥20.9.0)** — runtime for Next.js and CLI scripts (via `tsx`). Matches Vercel's serverless runtime. Bun is supported as a faster local package manager (`bun install`) but not required.
- **TypeScript** — strict mode.
- **Tailwind CSS 4** — `@theme` tokens in `app/globals.css`; no `tailwind.config.*` file.
- **Phosphor Icons** (`@phosphor-icons/react`) — the only icon library. The `code-review` skill blocks non-Phosphor icons.
- **`better-sqlite3`** — Node-native SQLite driver, single file at `data/rank.db`. Swapped back from `bun:sqlite` because Vercel's serverless functions run on Node.
- **`git` CLI** — shallow clones (`--depth 1 --single-branch`) via `node:child_process`.

## Run anything

```bash
bun install
bun run prepare-hooks  # once — installs lefthook git hooks (Biome + tsc on pre-commit)
bun run init-db        # optional — auto-runs on first score
bun run seed           # score the curated set (~30 repos) across GH / GL / BB
bun run dev            # http://localhost:3000
bun run score <url>    # score a single repo
```

## Layout

```txt
app/
  layout.tsx              # root layout (nav + footer) — defines root metadata + OG / Twitter cards
  page.tsx                # leaderboard
  repo/[id]/page.tsx      # repo detail with per-model suggestions (includes generateMetadata)
  methodology/page.tsx    # how the static scoring works
  roadmap/page.tsx        # upcoming versions (from lib/roadmap.ts)
  changelog/page.tsx      # what's in this build (from lib/changelog.ts)
  robots.ts               # /robots.txt — allows "/", disallows "/api/"
  sitemap.ts              # /sitemap.xml — static routes + every repo detail page
  api/repos/route.ts
  api/repo/[id]/route.ts
  globals.css             # Tailwind import + @theme tokens (no custom utilities)
components/               # Tailwind-styled React components
  Panel.tsx, ScoreBar.tsx, ScoreNumber.tsx, ScoreCell.tsx,
  HostPill.tsx, HostSelect.tsx, Medal.tsx, ModelPills.tsx,
  MobileNav.tsx, Pagination.tsx, SearchBar.tsx, SelectMenu.tsx, SortSelect.tsx,
  SignalRow.tsx, SuggestionItem.tsx, VersionPill.tsx,
  GoogleAnalytics.tsx
lib/
  constants/
    scoring.ts            # score thresholds, visible limits
    hosts.ts              # host label map
    sort.ts               # leaderboard sort keys
  utils/
    format.ts             # compactStars, relativeTime, hostLabel
    score.ts              # scoreTier + Tailwind class maps
  scoring/
    signals/              # one file per signal + helpers + types + index
    weights.ts            # per-model weight tables
    scorer.ts             # signals × weights, topImprovements
  clients/
    git.ts, github.ts
  db.ts                   # better-sqlite3 schema + queries
  version.ts              # APP_NAME, APP_VERSION, IS_PRE_RELEASE, APP_URL, APP_DESCRIPTION, REPO_URL
  changelog.ts            # typed ChangelogEntry[]
  roadmap.ts              # typed RoadmapVersion[]
scripts/
  init-db.ts, score.ts, seed.ts
tasks/
  README.md
  0.1.0/                  # released — shipped record
  0.2.0/                  # planned — complete the dogfood
  0.3.0/                  # planned — real per-model weights (benchmark harness)
  0.4.0/                  # planned — ecosystem integration (badge, PR diff, webhook, opt-out)
  0.5.0/                  # planned — discovery (alternative recommender)
  0.6.0/                  # planned — discovery (package-registry overlay)
  0.7.0/                  # planned — history-aware signals (closes the shallow-clone gap)
  1.0.0/                  # planned — production stability (Postgres + stable API)
  1.1.0/                  # planned — at-scale GitHub indexing (crawl + rank, not seed-only)
.claude/
  settings.json           # SessionStart + Stop hooks (Stop → hooks/stop-guard.sh)
  hooks/
    stop-guard.sh         # blocks turn end if source changed and /post-change-check hasn't run
  skills/                 # auto-selected workflows: code-review, quality-check, post-change-check
```

## I/O boundary (architecturally important)

- `lib/scoring/` is **pure** — no DB, no HTTP. It reads the cloned tree and that's it.
- `lib/clients/` and `lib/db.ts` own all external I/O.
- `app/` and `scripts/` are thin wrappers that call into the libs.
- `components/` are presentational — no data fetching, no side effects.

Keep it that way when adding features. If a component needs data, fetch in the page and pass props down.

## Conventions

- **Exact-pinned deps** in `package.json` (no `^`, no `latest`). Deterministic scoring.
- **Server components** unless interactivity requires client. Prefer `<Link>` + query params over client state.
- **All SQL** lives in `lib/db.ts`. Don't scatter `db.prepare(...)` elsewhere.
- **Signal IDs** are stable strings (`agents_md`, `tests`, etc.). Changing one = migration.
- **Tailwind first**, then `@theme` tokens. Avoid inline styles; avoid custom classes unless the pattern is truly repeatable.
- **No comments** explaining _what_ the code does. Only comment _why_ — the shallow-clone rationale in `lib/clients/git.ts` is the model.
- **Brand on UI**: "Agent Friendly Code" (no hyphen). Repo/package slug + GitHub `User-Agent` string: `agent-friendly-code`.
- **Version**: `APP_VERSION` in `lib/version.ts` and `package.json`'s `version` carry the current release number. Bump both (and add a new bucket in `lib/changelog.ts`) only when cutting a release — never when merging intermediate work.
- **Versioning + changelog**: bumps on `lib/version.ts` + `package.json` `version` happen only on a real release, coordinated with a new bucket in `lib/changelog.ts`. The changelog is a **user-facing capability log** — every bullet describes something a dashboard visitor or API caller can see, click, or call. Codebase hygiene (CI, linters, pre-commit, tests), pure internal refactors, dep bumps, and contributor-facing docs (CONTRIBUTING, PR templates) do **not** earn a changelog line — they stay in `tasks/` and the PR description. When a roadmap item ships, remove it from `lib/roadmap.ts` in the same PR — moved, not duplicated.

## Adding a signal

1. New file at `lib/scoring/signals/<kebab-id>.ts` implementing `Signal` (including `improveSuggestion`).
2. Import and add to the `SIGNALS` array in `lib/scoring/signals/index.ts`.
3. Add a weight entry to **every** model in `lib/scoring/weights.ts` — missing weights default to 0, decide deliberately.
4. Re-score: `bun run seed` is idempotent.

## Adding a model

1. Add a `ModelProfile` to `MODELS` in `lib/scoring/weights.ts` — weights for every signal.
2. Appears automatically in the leaderboard model pills and repo-page suggestions.

## Adding a host

1. Extend `parseRepoUrl` in `lib/clients/github.ts`.
2. Extend `fetchRepoMeta` with that host's API (use `process.env.<HOST>_TOKEN` if needed).
3. Add a seed URL in `scripts/seed.ts`.
4. Add the label to `lib/constants/hosts.ts`.

## Working from tasks/

Each version has its own folder (`tasks/0.X.0/`) with numbered task files. In a session, point the agent at a specific task:

> "Work on `tasks/0.2.0/01-tests.md`."

Read the task file for the goal + acceptance, the version's `README.md` for scope, and this `AGENTS.md` for conventions.

## Claude Code hooks + skills

`.claude/settings.json` has two hooks that run automatically:

- **`SessionStart`** — prints current release, roadmap summary, and the changelog rule.
- **`Stop`** — delegates to `.claude/hooks/stop-guard.sh`. If watched source paths changed this turn, the script emits `{"decision":"block","reason":...}` so the harness forces the model to invoke the `post-change-check` skill (docs-sync audit + code-review + quality-check) **before the turn can actually end**. The second Stop event (`stop_hook_active: true`) is the escape hatch — the guard exits 0 and the turn closes.

The `Stop` guard exists because reminders alone weren't enough — agents would acknowledge the checklist in prose and still close out without doing the work. Blocking the stop turns a soft nudge into a hard gate.

`.claude/skills/` holds project skills that are auto-selected based on task relevance or invoked manually (`/skill-name`). Skills **do not auto-fire on file edits** — that's what the Stop guard is for. The guard enforces `post-change-check`, which orchestrates the other two.

- **`code-review`** — writing-time conventions. Covers Tailwind-first (utilities > custom classes; `@theme` tokens > hex), **Phosphor Icons only** (blocks Lucide / Heroicons / React Icons / inline SVG / emoji-as-icon), the I/O boundary (`lib/scoring/` pure, all SQL in `lib/db.ts`), RSC preference, and when to extract into `components/` / `lib/constants/` / `lib/utils/`.
- **`quality-check`** — review-time sweep. Four dimensions: accessibility (landmarks, aria, contrast, reduced motion, keyboard reachability), responsiveness (320 → 1080+ viewports, mobile nav, tables), performance (RSC default, `next/script` for third-party, bundle size), security (parameterised SQL, no innerHTML, `rel=noopener`, clone safety).
- **`post-change-check`** — end-of-turn orchestrator. Runs a four-phase report: diff collection, docs-sync audit (changelog / tasks / AGENTS / README / .env.example / skills), then delegates to `code-review` and `quality-check`. The Stop guard blocks turn-close until this has run when watched paths changed.

Skill granularity rule of thumb: one skill per _phase_ of work (writing, reviewing, wrapping-up), not one skill per _rule_. Narrow skills fragment context; broad skills stay coherent.

Hooks docs: <https://docs.claude.com/en/docs/claude-code/hooks.html>.

## Security / threat surface (read before changing I/O)

- We `git clone --depth 1 --single-branch` arbitrary URLs — safe by default. We never run post-clone scripts, never `npm install`, never execute code from the clone.
- SQL: all queries parameterised. No interpolation.
- HTML: React auto-escapes; no `dangerouslyInnerHTML` anywhere.
- Local-path mode reads files; never writes outside `data/` and `tmp-clones/`.
- No auth yet (read-only dashboard). When auth lands (`tasks/0.4.0/04-opt-out-claim-flow.md`), do it via OAuth and gate DB writes per user.

**Operational concerns** (not code-level security) worth flagging before public launch:

- `tmp-clones/` can fill disk — add a cron/cap.
- Unauthenticated API → add rate limits before going public.
- Sandbox the cloner in a container when running on remote infra, just in case of future git CVEs.

## Things to leave alone

- Per-model weights are illustrative. Don't tune without `tasks/0.3.0/01-benchmark-harness.md`.
- SQLite schema is intentionally simple. Flag before restructuring.
- The I/O boundary. Scoring stays pure; DB stays in `lib/db.ts`.
- `APP_VERSION` — don't bump without a release.

## Useful pre-commit checks

- `bun run score https://github.com/honojs/hono` — end-to-end smoke.
- `curl -s localhost:3000/api/repos | head` — verify persistence + API.
- `bun x tsc --noEmit` — typecheck.
- Manual pass over `/`, `/repo/:id`, `/methodology`, `/roadmap`, `/changelog` after UI changes.

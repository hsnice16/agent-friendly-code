# 01 · Scheduled rescoring

**Status**: done

## Goal

Scores stay fresh without anyone running `bun run seed` by hand. Regressions are visible on the repo page.

## Approach

The original 0.6.0 sketch called for a GitHub-App webhook receiver + signed payload verification + queue + decay-cron worker. Re-evaluating against where the product actually is (no claim flow yet, single-writer SQLite committed in the repo, no user accounts), that design solves a freshness problem we don't have yet and brings persistence headaches with it. Defer it.

Instead: a GitHub Actions cron in this repo runs `bun run seed` every 6 hours, commits `data/rank.db` to `main` when it changed, and pushes. Vercel redeploys from `main` like any other commit — no new infra, no new deps, $0.

## Pieces shipped in this task

1. **`.github/workflows/scheduled-rescore.yml`** — cron `0 */6 * * *` + `workflow_dispatch`, `contents: write`, single-job concurrency group so two runs can't race the same `rank.db`. Skips the commit when no `overall_score` actually changed: dumps `(url, overall_score)` from `data/rank.db` via the preinstalled `sqlite3` CLI before and after `bun run seed`, then `diff -q` the two snapshots. A plain `git diff --quiet data/rank.db` doesn't work because `saveScoredRepo` rewrites `last_scored_at` on every UPSERT, so the binary file always differs.
2. **Regression capture in `lib/db.ts`** — new `previous_overall_score REAL` column on `repo`. The `saveScoredRepo` UPSERT sets `previous_overall_score = repo.overall_score` (the row's pre-update value) every time, so each rescore captures the prior score for free. (A one-shot `PRAGMA table_info` + `ALTER TABLE` migration shimmed older `data/rank.db` files during the rollout; it was removed once the bundled DB was re-seeded with the new schema.)
3. **Regression UI in `components/RepoHero.tsx`** — after `Last scored: <relative>`, inline a `+N.N pts` / `-N.N pts` diff in `text-ok` / `text-bad`. Hidden when `previous_overall_score` is null or the rounded diff is zero. `role="img"` + `aria-label` carries the prior absolute value to screen readers.
4. **16 new seed repos** added to `scripts/seed-list.ts` so the cron has more material to refresh.

## What this gives up vs the original spec

- **Sub-minute freshness on push** → up to 6h stale. For signals like README / AGENTS.md / CI files, that's well inside the noise floor.
- **Per-repo subscription** → no such concept. Webhook subscription only becomes meaningful once `tasks/0.7.0/01-opt-out-claim-flow.md` introduces repo ownership.

## Cost / footprint

- Public-repo GitHub Actions: free, unlimited minutes.
- ~200 repos × ~5–10s each ≈ ~30 min/run, well inside the 6h job limit and the 6h cadence.
- 4 Vercel redeploys/day from the auto-commit. Within Hobby-tier headroom.
- `data/rank.db` ≈ 200 KB; a year of 6-hourly commits is ~300 MB of git diffs. Revisit with `git gc` / LFS if it becomes painful.

## Future webhook layer (if we ever want it)

Add a webhook receiver as `app/api/webhook/github/route.ts` that verifies HMAC-SHA256 against a secret and triggers the same workflow via `workflow_dispatch` (or enqueues into a queue we'll have by then). The cron stays as the floor; webhooks become a latency optimization. Best landed alongside the claim flow in 0.7.0.

## Acceptance

- `.github/workflows/scheduled-rescore.yml` runs successfully on its first scheduled invocation (manually dispatchable from the Actions tab for verification).
- An unchanged-score run does **not** create a commit.
- A changed-score run produces one commit on `main` touching only `data/rank.db`.
- Repo detail page renders `+N.N pts` / `-N.N pts` next to "Last scored" after the second-ever rescore for a repo; renders nothing on the first scoring.

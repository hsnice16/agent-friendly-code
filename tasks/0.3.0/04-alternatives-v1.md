# 04 · Alternative recommender (v1)

**Status**: done

## Goal

On the repo detail page, show a short "alternatives" strip: _"Repos that look similar to this one, ranked for your selected model."_ v1 keeps it cheap and boring so it ships with 0.3.0.

## What shipped

- Schema additive migration: `repo.language TEXT` (nullable). Applied via idempotent `ALTER TABLE ... ADD COLUMN` wrapped in try/catch — safe on re-runs.
- `lib/clients/github.ts` — `fetchRepoMeta` now returns `language` alongside `defaultBranch` and `stars`. GitHub + Bitbucket expose it directly; GitLab needs a separate endpoint, so it stays `null` there for v1.
- `scripts/score.ts` — pipes the language through to `saveScoredRepo`; `saveScoredRepo` uses `COALESCE` on conflict so a rescore without language (e.g. offline) doesn't blow away an existing value.
- `lib/db.ts` — new `getAlternatives(repoId, modelId | null, limit)` query. Filters: same host + same language + `id != self`. Orders by the selected model's `model_score` when a model is given, else `overall_score`.
- `components/AlternativesStrip.tsx` — up to 3 cards in a grid (single column on mobile, 3-col at `sm:`), each linking to the candidate's repo page. Panel is suppressed entirely when the query returns zero rows. UI flags itself as "heuristic v1" and points at v0.5.0 for refinement.
- `app/repo/[id]/page.tsx` — renders the strip between `PerModelScores` and `Signal breakdown`.

## Acceptance

- ✓ Repo detail page shows up to 3 alternatives when ≥ 1 same-language/same-host repo exists; `AlternativesStrip` returns `null` otherwise (no empty panel).
- ✓ Alternatives reorder when the active model changes (query respects `modelId` and joins `model_score`).
- ✓ Query stays in `lib/db.ts`; no SQL leaks into `app/` or `components/`.
- ~ One test in `tests/db.test.ts` — not added in this pass; follow-up.

## Known limitations (improve in v2 — `tasks/0.5.0/`)

- **Cross-language alternatives get missed** — `axios` (JS) vs `requests` (Python) are semantic alternatives but different languages. v1 will never surface these; v2 in 0.5.0 lifts this with README-embedding similarity.
- **Language alone is coarse** — a Rust CLI tool and a Rust ORM share a language but aren't alternatives. The UI flags itself as "heuristic v1" so users know the confidence level.
- **No topic clustering** — `react` and `nextjs` appear as "alternatives" because both are top-scoring JS repos, even though they're complementary. Acceptable noise for v1.
- **Back-fill**: repos scored before this change have `language = NULL` until rescored. The heuristic excludes `NULL`-language rows, so the strip renders only on rescored repos until the next full re-seed.

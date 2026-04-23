# 01 · History-aware signals

**Status**: planned

## Goal

Score signals that need git history or repo activity data, which the current `--depth 1 --single-branch` clone can't provide.

## Context

Today's scorer reads file contents from the working tree at HEAD of the default branch. This is correct for the 12 static signals (presence of `AGENTS.md`, `tests/`, CI configs, etc.) but misses anything time-derived. Methodology's "What isn't measured yet" section acknowledges this; v0.7.0 closes the gap.

## Candidate signals (pick ≥ 3 to ship)

- **Maintenance recency** — last commit date vs. today.
- **Commit velocity** — commits over a trailing window (90-day default).
- **Active contributors** — distinct authors in the same window.
- **Recent regressions** — score drop since the previous scan (requires persisted history on our side).
- **Release cadence** — tags per year, or releases per `GITHUB_RELEASES_API`.

## Implementation options

1. **Deepen the clone** just enough (`--depth 200` or `--shallow-since=90.days.ago`) for recency-based signals. Still bandwidth-bounded, but simplest.
2. **Supplement with host APIs** — GitHub `/repos/:owner/:repo/commits?since=…`, GitLab analogues. Existing `lib/clients/github.ts` is the place to extend. Respects tokens we already read from env (`GITHUB_TOKEN`, `GITLAB_TOKEN`).
3. **Hybrid** — shallow clone for file-content signals (unchanged), host API for history signals. No extra clone cost; rate-limit awareness needed.

Prefer (3). It keeps `lib/clients/git.ts` thin and lets us degrade gracefully to "unknown" when the API rate-limits.

## Acceptance

- At least 3 history-aware signals added to `lib/scoring/signals/` with stable IDs (migration-safe).
- Each new signal has a weight entry in every model in `lib/scoring/weights.ts`.
- Hybrid fetch strategy documented in `AGENTS.md` under "I/O boundary".
- Re-scoring a repo with and without a token yields the same static signals; history signals degrade to neutral when the token is absent.

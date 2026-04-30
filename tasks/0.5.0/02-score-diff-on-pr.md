# 02 · Score diff on PR

**Status**: done

## Goal

GitHub Action that re-scores on each PR and posts a comment: "this PR drops your Claude Code score by 4.1 points because it removed CI config." Listed on the GitHub Marketplace, opt-in, and self-contained — keeps working even if the web app goes down.

## Shape

The action runs **inside the maintainer's CI**, not on our infrastructure:

1. `actions/checkout` (with `fetch-depth: 0`) gives the action the PR head and access to base history.
2. The action `git fetch`es the base ref and checks it out into a worktree.
3. Scores both trees with the bundled scorer.
4. Posts (or edits) a single PR comment with the delta + per-signal breakdown.

No clone over the network for either side — everything happens on what `actions/checkout` already produced.

### Action vs. webhook (split with 0.6.0/01)

Two products, one pipeline:

- **This task (0.5.0/02)** → action is **read-only**. It scores, comments, exits. No DB write.
- **0.6.0/01 webhook rescoring** → server-side GitHub App listens for `push` / `pull_request.merged` and refreshes our DB.

Reasons for the split: webhooks fire only on merge-to-default-branch (the right rescore trigger); the action runs on every PR commit (too noisy for DB writes); maintainers don't have to ship credentials for our API to install the action.

## Multi-repo layout

The action becomes a sibling repo, not a subdir of this one. Marketplace requires `action.yml` at the root, and the scorer needs to be reusable across the action, the web app, the agent skill (0.5.0/03), and the benchmark harness (1.0.0/03).

```
personal/                              ← workspace root (sibling repos)
  agent-friendly-code/                 ← this repo (web app)
  agent-friendly-action/               ← new repo (this task)
  agent-friendly-scorer/               ← extracted later (npm package)
  agent-friendly-weights/              ← extracted when 1.0.0 lands
```

For v1 of the action, the scorer is **vendored into the action's bundle via `ncc`** — no published npm package required to ship. The extraction to a standalone `agent-friendly-scorer` package is a follow-up that the agent skill (0.5.0/03) and benchmark harness (1.0.0/03) will also consume.

## Weights resilience (three tiers)

Hardcoded weights today; benchmark-derived weights later (1.0.0/03). The action handles this via a fallback hierarchy:

```
1. Fresh from /api/weights        ← primary, refetched per run    (added in 1.0.0)
2. Last-good cached locally       ← actions/cache                  (added in 1.0.0)
3. Bundled hardcoded defaults     ← shipped inside dist/           (v1 only)
```

For **v1 of this task**, only tier 3 is shipped. The scorer is refactored to take `weights` as a parameter so tiers 1 and 2 are a drop-in addition later, with no consumer-side changes.

Weight staleness is well-tolerated for diff scoring — both base and head are scored with the same weights, so bias cancels in the delta. Maintainers pinned to old action versions still get useful PR feedback.

## Marketplace listing

GitHub Marketplace listings for Actions are **free**. Requirements:

- Public repo with `action.yml` at the root.
- Branding (icon + color in `action.yml`), categories, semver tags.
- Two-factor auth on the publishing account; accept Marketplace Developer Agreement.
- Publish via GitHub Releases UI ("Publish this Action to the GitHub Marketplace").

Target listing: `agent-friendly` (or similar) under `Code Quality` / `Continuous Integration`.

## Opt-in via `AGENTS_BADGE_TOKEN`

Marker, not credential. The action reads `AGENTS_BADGE_TOKEN` from the workflow's env / secrets:

- **Set** → action runs normally, comments on the PR.
- **Unset** → action returns early, exits 0, no log spam.

Lets us ship the action inside starter-repo templates without it firing for forks or unenrolled installs. No real auth in v1; if `/api/weights` ever becomes rate-limited or per-tenant, the same env var can be promoted to a real key.

## Implementation steps

### In `agent-friendly-code` (this repo)

1. Refactor `lib/scoring/scorer.ts` to accept `models: ModelProfile[]` as an optional parameter (`scoreRepo(path, models?)`, `topImprovements(modelId, signals, limit, models?)`). `MODELS` from `lib/scoring/weights.ts` becomes the **default** when no array is passed. Taking the full `ModelProfile[]` (not just `weights`) lets consumers swap weights, scope to one model, or substitute a benchmark-derived weight set in one move. No behavioural change.
2. Add `GET /api/score?host=github&repo=<owner>/<name>` (overlaps with 0.5.0/03 — same endpoint, both tasks consume it).
3. Document the action's existence on a docs page once it's live.

### In `agent-friendly-action` (sibling repo, scaffolded as part of this task)

1. `action.yml` at root — `inputs`: `github-token` (defaults to `${{ github.token }}`), `agents-badge-token` (required), optional `base-ref`. Branding: icon + color.
2. `src/index.ts` (TypeScript, bundled with `@vercel/ncc`):
   - Read `AGENTS_BADGE_TOKEN`; exit 0 if unset.
   - Resolve base + head refs from the GitHub event payload.
   - `git fetch` base into a worktree, score both trees.
   - Compute diff (overall + per-signal + per-model).
   - Find existing comment by marker (`<!-- agent-friendly-action -->`) and edit, or create new.
3. Vendor scorer code from `agent-friendly-code/lib/scoring/` until extracted to its own package.
4. CI (`.github/workflows/`):
   - On push: run `ncc build` and verify `dist/` is in sync.
   - On release tag: ensure `dist/` is committed; that's what consumers actually load.
5. Smoke-test workflow that runs the action against a small fixture repo on every PR to the action's own repo.
6. README with install snippet:

   ```yaml
   - uses: hsnice16/agent-friendly-action@v0
     with:
       agents-badge-token: ${{ secrets.AGENTS_BADGE_TOKEN }}
   ```

## Acceptance

- Action runs in CI, reads `AGENTS_BADGE_TOKEN`, exits silently when unset.
- On a PR with `AGENTS_BADGE_TOKEN` set, posts (or edits) a comment with the score delta.
- Diff is readable in-line — overall delta, per-signal changes, per-model summary. Not just a link.
- Falls through silently when not configured (no token, no comment, no error).
- Bundled scorer reproduces the same overall score this repo's CLI produces for the same commit.
- `dist/` builds reproducibly via `ncc` and is committed.
- Action repo published with semver tags; the major-version floating tag (`v0` for pre-1.0, bumping to `v1` once stable) points at the latest release in that major.
- Marketplace listing live.

## Out of scope (deferred)

- Runtime weights refresh (tiers 1 + 2). Lands when 1.0.0/03 publishes its first weight set.
- Action POSTing to our DB / webhook. Lives in 0.6.0/01 as a server-side GitHub App.
- Per-language or per-agent comment customisation.
- On-demand scoring of unindexed repos via the action.

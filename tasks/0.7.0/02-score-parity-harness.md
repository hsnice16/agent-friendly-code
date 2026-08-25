# 02 · Score parity harness

**Status**: done

## Goal

A CI gate that fails when the tree materializer scores differently from a real clone of the same commit. Without it, the live path can silently disagree with the Action and the skill.

## Why this is a gate, not polish

The content candidate list is a hand-derived projection of what the signals read *today*. Add a signal tomorrow that reads `Cargo.toml` and the live path scores it 0 while the Action scores it correctly — no error, no log line, just a wrong number on a public page.

That is not hypothetical. Building the materializer produced **five** defects, every one silent:

| Found | Cost |
|---|---|
| `export-ignore` invalidating the tarball substrate | 17 of 231 repos, up to 40 pts |
| GitHub tree truncation dropping root files | kotlin, 26.8 pts |
| `.trim()` repairing a broken symlink target | vercel/ai, 6.7 pts |
| Symlink cap dropping entries instead of degrading | zed, 51 files |
| Submodules counted as files | graphviz, 2 files |

Plus the bug this harness's throwaway ancestor found in ten minutes: case-sensitive `firstExisting`, shipped in #12, which was under-scoring `vercel/next.js` by 18.5 points on the live leaderboard.

## Approach

For each fixture: shallow-clone it, read its `HEAD` SHA, materialize the tree **pinned to that SHA** so staleness cannot fake a diff, score both, and assert the two `RepoScore` objects match — overall, per-model, and every signal's `pass` / `detail` / `matchedPath`.

Comparing `detail` and not just `overall` is what caught the submodule and symlink bugs: both left the overall score untouched and moved only a file count, one bucket boundary away from mattering.

Fixtures must cover the failure classes rather than just popular repos:

- a non-`README.md` spelling (`Readme.md`)
- `.cursor/rules` as a directory, no AGENTS.md
- a dangling symlink (`cloudflare/vinext`)
- a link target with a trailing newline (`vercel/ai`)
- submodules (`graphviz/graphviz`)
- a truncating tree (`JetBrains/kotlin`)
- one repo per host

## Pieces

1. **`scripts/parity-check.ts`** — clone-vs-materializer comparison, per-signal diff table, non-zero exit on any mismatch.
2. **`.github/workflows/parity.yml`** — fixture subset on PRs touching `lib/scoring/**` or `lib/live-score/**`; full matrix daily.
3. **Allowlist-drift detection** — removing a content candidate must make the harness *fail*, not silently skip.

## Runner notes

Learned from the validation run, so the CI job does not rediscover them:

- Run with low concurrency. At four parallel workers, kotlin and pytorch both produced spurious diffs that vanished on isolated re-run.
- Guard the cleanup. `delta-io/delta` nests Hive fixtures deep enough to blow macOS's `PATH_MAX` during `rmSync`, and an unguarded `finally` killed a 321-repo run outright.
- Keep the work directory path short, for the same reason.

## Acceptance

- Removing a content candidate fails the harness with a readable diff naming the signal.
- Each of the five defects above has a fixture that reproduces it against a deliberately reverted fix.
- Green on `main` before task 03 ships.

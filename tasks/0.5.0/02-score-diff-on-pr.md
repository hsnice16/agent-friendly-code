# 02 · Score diff on PR

**Status**: planned

## Goal

GitHub Action that re-scores on each PR and posts a comment: "this PR drops your Claude Code score by 4.1 points because it removed CI config."

## Acceptance

- Diff is readable in-line (not just a link).
- Opt-in via `AGENTS_BADGE_TOKEN` or similar.
- Falls through silently when not configured.

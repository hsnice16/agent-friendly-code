# 03 · Benchmark harness

**Status**: planned

## Goal

Actually run agents on scoped tasks derived from each repo's own git history, so per-model weights reflect measured success instead of guesswork.

## Sketch

- For each repo, generate N synthetic tasks from its last N bug-fix commits: reset to the parent, give the agent the fix's PR title + failing tests, measure pass/fail.
- Run each task with each supported agent harness in a sandboxed container.
- Regress signal presence × agent-success to derive weights.
- Publish the harness open-source; publish the derived weights.

## Risks

- Cost at scale — sample small first.
- Fair comparison across agents is non-trivial; keep scaffolding constant.
- Synthetic task generation needs careful de-duplication and quality control.

## Dependency

Blocker for removing the "illustrative weights" disclaimer in the README and on the dashboard.

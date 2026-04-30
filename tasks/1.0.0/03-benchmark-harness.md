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

## Output: `agent-friendly-weights` package

The harness emits a versioned weights JSON consumed by every downstream:

```
agent-friendly-bench (this task) ──emits──▶ agent-friendly-weights (npm)
                                                      │
                                  ┌───────────────────┼───────────────────┐
                                  ▼                   ▼                   ▼
                       agent-friendly-code   agent-friendly-action   agent-friendly-scorer
                          (web app)         (CI Marketplace action)   (default weights bundled)
```

Keep the **scorer pure** — it takes the model profiles (which carry their weights) as a parameter, never imports them transitively. Agent SDKs (`@anthropic-ai/sdk`, OpenAI, etc.) and sandbox infra live only in this harness; they never reach the scorer, the action, or the web app.

## Relation to 0.5.0/02 (PR-diff action)

The action ships with bundled weights as fallback (tier 3). When this harness publishes its first weight set, the action gains:

- **Tier 1**: fresh fetch from `/api/weights` per run.
- **Tier 2**: last-good cached locally via `actions/cache`.
- **Tier 3**: bundled defaults (already shipped in 0.5.0/02).

The scorer signature added in 0.5.0/02 (`scoreRepo(path, models?)`, `topImprovements(modelId, signals, limit, models?)`) is the seam that makes this drop-in. No consumer-side refactor required when this task lands — the action rebuilds its `ModelProfile[]` from the freshly fetched weights and the existing model metadata, then passes it through.

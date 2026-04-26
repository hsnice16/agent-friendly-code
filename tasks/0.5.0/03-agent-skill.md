# 03 · Agent skill (with public score lookup)

**Status**: planned

## Goal

Ship an agent skill that fetches the active repo's score and recommends a model, plus the public lookup endpoint it depends on and a UI page that explains the integration. Bundled because the endpoint has no other consumer in 0.5.0 and the three pieces only make sense together.

The skill itself is portable — installable via `npx skills add hsnice16/agent-friendly-code`. The [vercel-labs/skills](https://github.com/vercel-labs/skills) CLI supports Claude Code, Codex, Cursor, Cline, Copilot, and 40+ other agents, and writes to the right per-agent directory based on the `--agent` flag.

## Pieces

### 1. Public lookup endpoint

`GET /api/score?host=github&repo=<owner>/<name>`

- 200 with `{ repo, signals, modelScores }` — same shape as `/api/repo/[id]` so consumers share a type.
- 404 with `{ error: "not_indexed" }` when not found — explicit so the skill can branch on it cleanly.
- 400 on malformed `repo`. `host` defaults to `github`.
- Thin wrapper around `getRepoByHostOwnerName` in `lib/db.ts`. No on-demand scoring; no GitHub token usage at request time.

### 2. The skill

```text
skills/
  agent-friendly/
    SKILL.md
```

Frontmatter (per vercel-labs/skills convention — agent-neutral):

```yaml
---
name: agent-friendly
description: Check the active repo's agent-friendliness score and recommend a model. Use when the user asks "is this repo a mess?", "which model should I use here?", or invokes /agent-friendly.
---
```

Body: instructions for the agent to (a) resolve `owner/name` from the git remote, (b) `GET /api/score` against the deployed instance, (c) on 200, render score + recommended model, (d) on 404, say so plainly and skip the recommendation, (e) on first invocation, surface the auto-check hook snippet so the user can opt into automatic checks (when their agent supports session-start hooks). Score → model mapping lives in this file (high score → frontier model, low score → small/fast model); exact thresholds and model IDs land during implementation. Recommendation is provider-neutral — the same score buckets map to Opus/Sonnet/Haiku, GPT-5/4o-mini, etc.

### 3. UI page

New route (e.g. `/skill` or `/integrations/agents`):

- One-paragraph pitch.
- Install command: `npx skills add hsnice16/agent-friendly-code` (link to the [vercel-labs/skills](https://github.com/vercel-labs/skills) agent list so users know it isn't Claude Code-only).
- Manual invocation: `/agent-friendly` (or whatever invocation the host agent uses).
- Optional auto-check hook snippets — shown for the agents that support session-start hooks today:
  - **Claude Code**: `SessionStart` hook in `.claude/settings.json`
  - **Codex CLI**: `SessionStart` matcher in `.codex/hooks.json` ([docs](https://developers.openai.com/codex/hooks))
  - **Cursor / Cline / others**: no session-start hook event yet — the skill itself fires when the user mentions the repo, or they can paste the snippet into `.cursorrules` / `.clinerules` as a static instruction.
- Linked from the homepage and added to `lib/roadmap.ts`.

The hook snippets on the UI page and the skill's first-invocation nudge must stay in sync — same content, multiple surfaces.

## Acceptance

- `GET /api/score?host=github&repo=owner/name` returns the documented shape; 404 body distinguishes `not_indexed` from generic errors.
- `npx skills add hsnice16/agent-friendly-code` installs into the right per-agent directory (`.claude/skills/agent-friendly/`, `.codex/skills/agent-friendly/`, `.cursor/skills/agent-friendly/`, …).
- `/agent-friendly` in a session inside a git repo prints the score + model recommendation, or a clean "not indexed" message.
- UI page is reachable from the homepage; install command + hook snippets match the skill's output, and the page makes clear which agents support the auto-check hook today.
- README gains a short "Public API" section pointing skill / hook authors at `/api/score`.

## Out of scope

- On-demand scoring of unindexed repos.
- Programmatic model switching. The skill recommends; the user runs `/model` (or their agent's equivalent) themselves.
- Per-agent forks of the skill body. One `SKILL.md` for all agents; only the optional hook snippet differs by host.

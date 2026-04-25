# 03 · Claude Code skill (with public score lookup)

**Status**: planned

## Goal

Ship a Claude Code skill that fetches the active repo's score and recommends a model, plus the public lookup endpoint it depends on and a UI page that explains the integration. Bundled because the endpoint has no other consumer in 0.4.0 and the three pieces only make sense together.

Installable via `npx skills add hsnice16/agent-friendly-code` (the [vercel-labs/skills](https://github.com/vercel-labs/skills) CLI auto-discovers a top-level `skills/` directory).

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

Frontmatter (per vercel-labs/skills convention):

```yaml
---
name: agent-friendly
description: Check the active repo's agent-friendliness score and recommend a Claude model. Use when the user asks "is this repo a mess?", "which model should I use here?", or invokes /agent-friendly.
---
```

Body: instructions for Claude to (a) resolve `owner/name` from the git remote, (b) `GET /api/score` against the deployed instance, (c) on 200, render score + recommended model, (d) on 404, say so plainly and skip the recommendation, (e) on first invocation, surface the SessionStart hook snippet so the user can opt into automatic checks. Score → model mapping lives in this file (high score → Opus / Sonnet, low score → Haiku); exact thresholds and model IDs land during implementation.

### 3. UI page

New route (e.g. `/skill` or `/integrations/claude-code`):

- One-paragraph pitch.
- Install command: `npx skills add hsnice16/agent-friendly-code`.
- Manual invocation: `/agent-friendly`.
- Copy-paste `SessionStart` hook snippet for `.claude/settings.json` that `curl`s `/api/score` and prints score + recommendation into the session context.
- Linked from the homepage and added to `lib/roadmap.ts`.

The hook snippet on the UI page and the skill's first-invocation nudge must stay in sync — same content, two surfaces.

## Acceptance

- `GET /api/score?host=github&repo=owner/name` returns the documented shape; 404 body distinguishes `not_indexed` from generic errors.
- `npx skills add hsnice16/agent-friendly-code` installs into `.claude/skills/agent-friendly/`.
- `/agent-friendly` in a Claude Code session inside a git repo prints the score + model recommendation, or a clean "not indexed" message.
- UI page is reachable from the homepage; install command + hook snippet match the skill's output.
- README gains a short "Public API" section pointing skill / hook authors at `/api/score`.

## Out of scope

- On-demand scoring of unindexed repos.
- Programmatic model switching. The skill recommends; the user runs `/model` themselves.

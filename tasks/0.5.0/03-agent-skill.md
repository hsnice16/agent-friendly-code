# 03 · Agent skill

**Status**: done

## Goal

Ship a portable agent skill that scores the user's current repo locally and recommends a model for it. The skill runs entirely on the user's machine — vendored scorer, no HTTP calls, dashboard-independent. Same self-contained property as the PR-diff GitHub Action: if `agent-friendly-code` goes offline tomorrow, the skill keeps producing recommendations unchanged.

The skill profiles **8 agents** — the same set this dashboard's `lib/scoring/weights.ts` covers (Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Aider, OpenHands, Pi). It installs into any [`vercel-labs/skills`](https://github.com/vercel-labs/skills)-compatible agent via `npx skills add hsnice16/agent-friendly-skill`; the CLI autodetects locally configured agents and writes to each one's skill directory. Scoring is identical regardless of which agent invokes the skill — the scorer always returns all 8 per-agent scores in `modelScores`, and the best-fit pick is score-driven, not driven by who's calling. Agents outside the 8 (Cline, Copilot, Continue, Roo Code, Windsurf, Amp, …) install fine and see exactly the same output. Pin a ref via the CLI's `#<ref>` fragment syntax (e.g. `…#v0` for the latest 0.x.y, `…#v0.1.0` for a precise tag) — `@<ref>` is reserved for skill-name filtering and won't pin.

## Why local-first

The original spec had the skill `GET /api/score`, but the action already showed the better pattern: vendor the scorer, score the user's tree on disk, no service dependency.

Local-first means:

- **Works for any repo**, not just ones the dashboard has indexed.
- **Works offline** after install — scoring is pure file-system reads.
- **Survives outages** — dashboard down ≠ skill broken.
- **No on-demand scoring API** — the dashboard's `/api/score` stays read-only and isn't load-bearing for skill traffic.

This converts the skill into the second consumer of the vendored scorer (after the action), strengthening the case for eventually extracting `agent-friendly-scorer` as a standalone npm package — but that extraction stays deferred to `tasks/1.0.0/03-benchmark-harness.md` per the existing AGENTS.md note. For now, two siblings vendor + mirror the scorer; the discipline already exists for the action and just needs to be extended to one more repo.

## Pieces

### 1. Sibling repo `agent-friendly-skill` (the bulk of the work)

Created as a sibling repo alongside this one, mirroring `agent-friendly-action`'s shape:

```text
agent-friendly-skill/
  SKILL.md                 frontmatter + body (instructions to the agent)
  src/
    scoring/               vendored from agent-friendly-code/lib/scoring/
    index.ts               thin entry: parse argv → scoreRepo(path) → JSON
  dist/
    index.js               ncc-bundled, single file, no runtime deps, committed
  package.json             "private": true; ncc build script
  README.md
  CHANGELOG.md
  .github/workflows/       in-sync check (dist matches src) + smoke test
  tsconfig.json, biome.json, lefthook.yml — match dashboard conventions
```

**SKILL.md frontmatter** (per `vercel-labs/skills` convention — agent-neutral):

```yaml
---
name: agent-friendly
description: Score the current repo's agent-friendliness and recommend a model. Use when the user asks "is this repo a mess?", "which model should I use here?", or invokes /agent-friendly.
---
```

**SKILL.md body** instructs the agent to:

1. Tell the user upfront that the skill scores the current working directory — so they should be at their project root, or pass an explicit path. (Belt-and-suspenders: the CLI itself emits a `warnings[]` entry when the target has no project markers — `package.json` / `README.md` / `AGENTS.md` / `.git`. The agent surfaces those warnings before showing the score.)
2. Run the bundled scorer: `node <skill-dir>/dist/index.js .`. The skill dir is the directory containing this `SKILL.md` — most agents resolve that automatically.
3. Parse the JSON: overall score, `warnings[]`, per-signal results, per-model scores, top improvements.
4. Pick the highest-scoring entry in `modelScores` as the best-fit agent. The recommendation is **score-driven**, not based on which agent invoked the skill — same answer regardless. Show a runner-up if its score is within ~5 points of the best.
5. Map the overall score to a band (high / mid / low) and recommend a model **class** (frontier / standard / small) using the table embedded in `SKILL.md`. Provider-neutral — buckets cover Anthropic / OpenAI / Google. Tell the user how to switch (`/model` etc.) but **never switch programmatically**.
6. On first invocation, surface the optional `SessionStart` hook snippet so the user can opt into automatic checks (when their agent supports session-start hooks).

### 2. Public lookup endpoint (already shipped — task 02)

`GET /api/score?host=github&repo=<owner>/<name>` shipped with `tasks/0.5.0/02`. The skill **does not call it** — it's documented in this repo's README "Public API" section as a public read for external integrators (third-party tools, browser overlays, future consumers). Same response shape as `/api/repo/[id]`; 404 distinguishes `not_indexed` from generic errors.

### 3. UI page on the dashboard (`/skill`)

Mirrors the shape of `app/action/page.tsx`:

- One-paragraph pitch ("self-contained, no service dependency, scores any repo on disk").
- Install command: `npx skills add hsnice16/agent-friendly-skill` (linked to the [vercel-labs/skills](https://github.com/vercel-labs/skills) agent compatibility list so users know it isn't Claude Code-only).
- Manual invocation: `/agent-friendly` (or whatever invocation phrase the agent uses).
- Optional auto-check `SessionStart` hook snippets for the agents that support them today:
  - **Claude Code**: `SessionStart` matcher in `.claude/settings.json`
  - **Codex CLI**: `SessionStart` matcher in `.codex/hooks.json`
  - **Cursor / Cline / others**: no session-start hook event yet — the skill itself fires when the user mentions the repo, or paste the snippet into `.cursorrules` / `.clinerules` as a static instruction.
- Source link to `agent-friendly-skill` repo.
- FAQ + JSON-LD (BreadcrumbList + SoftwareApplication + FAQPage) matching `/action`.
- Linked from homepage hero, footer nav, sitemap, and `/llms.txt`.

The hook snippets on the UI page and the skill's first-invocation nudge must stay in sync — same content, multiple surfaces. Single source of truth lives in the skill repo's README; the dashboard page mirrors it.

## Acceptance

- `npx skills add hsnice16/agent-friendly-skill` installs SKILL.md + the bundled scorer (`dist/index.js`) into the right per-agent directory.
- `/agent-friendly` (or the agent's equivalent) inside any local git repo prints the score + model recommendation, fully offline. No HTTP call.
- The bundled scorer reproduces the same overall score this repo's CLI produces for the same path.
- `dist/index.js` builds reproducibly via `ncc` and is committed; CI verifies in-sync on every push to `agent-friendly-skill`.
- `agent-friendly-skill` repo published with semver tags; major-version floating tag (`v0` for pre-1.0) points at the latest release in that major.
- `/skill` UI page is reachable from the homepage and footer; install command + hook snippets match the skill repo's README.
- README "Public API" section documents `/api/score` for external integrators.

## Out of scope

- npm-publishing the bundled scorer as `agent-friendly-skill` package. Deferred until someone actually wants `agent-friendly` on PATH outside the skill install — a one-line `package.json` flip whenever it lands.
- On-demand scoring of unindexed repos via the dashboard. Not needed; skill scores locally.
- Programmatic model switching. The skill recommends; the user runs `/model` (or the agent's equivalent) themselves.
- Per-agent forks of the SKILL.md body. One file for all agents; only the optional hook snippet differs by agent.

## Cross-reference

- **0.5.0/02 (action — shipped)**: same vendoring + ncc-bundle pattern. AGENTS.md "Sibling repos" mirror discipline now covers both action and skill.
- **1.0.0/03 (benchmark harness)**: still the planned trigger for extracting `agent-friendly-scorer` as a standalone npm package. The skill is the second vendor consumer; harness would be the third.

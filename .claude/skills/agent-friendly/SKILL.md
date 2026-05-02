---
name: agent-friendly
description: Score the current repo's agent-friendliness on disk and recommend a model class to use for it. Use when the user asks "is this repo a mess?", "which model should I use here?", "is my repo agent-ready?", or invokes /agent-friendly.
---

# agent-friendly

Score the user's current repo locally with a bundled scorer and recommend a model class. Evaluates 16 static signals (AGENTS.md, CI, tests, README, linter, dev env, license, contributing, pre-commit hooks, deps manifest, type config, codebase size, plus four agent-specific instruction files) and produces overall + per-model scores. Entirely local — no HTTP calls.

## When to use

Invoke this skill when the user:

- Asks about the agent-friendliness of the current repo.
- Wants a model recommendation for the codebase they're in.
- Invokes `/agent-friendly` (or however their agent triggers skills) explicitly.

Skip when the user is asking about a different repo, a remote URL, or a concept rather than a specific local path — this skill operates only on the local file system.

## How to run

1. **Tell the user upfront**: _"I'll score the current working directory. Make sure you're at your project root — if you're in a subdirectory (`src/`, `app/`, etc.), the score will be artificially low. Pass the project root path explicitly if you want me to score somewhere else."_ Wait for confirmation only if cwd looks ambiguous (e.g. you can see they're inside a typical subdirectory name); otherwise just proceed.

2. Run the bundled scorer against the user's current working directory:

   ```bash
   node <skill-dir>/dist/index.js .
   ```

   `<skill-dir>` is the directory containing this `SKILL.md` (typically `.claude/skills/agent-friendly/` for Claude Code, `.agents/skills/agent-friendly/` for Codex / Cursor / Cline / others). Most agents resolve this automatically — if yours doesn't, look in the agent's skill directory.

   The CLI defaults to `process.cwd()` if no path is passed, so `node <skill-dir>/dist/index.js` (no argument) works equivalently. If the user explicitly asks to score a different repo on disk, pass that path as the first argument.

3. Parse the JSON output:

   ```jsonc
   {
     "overall": 87.4,
     "warnings": [], // string[] — surface to user before showing the score if non-empty
     "signals": [
       { "id": "agents_md", "label": "AGENTS.md", "pass": 1, "matchedPath": "AGENTS.md" }
       // 15 more signals...
     ],
     "modelScores": [
       {
         "modelId": "claude-code",
         "modelLabel": "Claude Code",
         "score": 89.2,
         "contributions": [
           /* ... */
         ]
       }
       // 7 more models...
     ],
     "topImprovements": [
       { "label": "Contributing guide", "signalId": "contributing", "scoreGain": 2.1, "suggestion": "..." }
       // up to 3 entries
     ]
   }
   ```

   The `warnings` array is the CLI's heads-up channel. Today it fires when the path being scored doesn't look like a project root (no `package.json`/`README.md`/`AGENTS.md`/`.git` found). If non-empty, render the warning(s) to the user **before** showing the score so they can re-invoke from the right place.

## How to render the result

The scorer profiles **8 agents** and always returns scores for all of them in `modelScores`: Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Aider, OpenHands, and Pi.

**The recommendation is score-driven.** Don't try to detect which agent is invoking this skill — the answer is the same either way: find the highest-scoring entry in `modelScores`, that's the agent this repo is most tuned for. Show the user; let them decide whether to switch. Never programmatically switch the agent or model.

Print a tight summary the user can read at a glance:

- **Overall score** with a band label (high / mid / low — see table below).
- **Best-fit agent** — the highest-scoring entry in `modelScores`, with its score.
- **Runner-up** if its score is within ~5 points of the best — gives the user a real alternative.
- **Why** — one short sentence pointing at the strongest signals (e.g. "strong AGENTS.md, tests in place, reproducible dev env"). Use the `signals` array (signals with `pass: 1` and high weight in the best agent's profile).
- **Recommended model class** — mapped from the overall score (frontier / standard / small — see table). Note that the user can switch using `/model` (Claude Code / Codex / Gemini CLI), `/profile` (Cursor), or whatever their agent's equivalent is — but **don't switch for them**, just suggest.
- **Top improvements** — up to 3 entries from `topImprovements`, each with its score gain.

Example output:

```text
Agent-friendliness: 87.4 (high) — well-prepped for AI coding agents.
Best for: Claude Code (89.2). Cursor close behind at 86.1.
Why: strong AGENTS.md, tests in place, reproducible dev env.
Recommendation: frontier model (Opus / GPT-5 / Gemini 2.5 Pro). Switch via /model (or your agent's equivalent) if you want to — your call.
Top improvements:
  • Add a contributing guide (+2.1 pts)
  • Add pre-commit hooks (+1.4 pts)
  • Document the test command (+0.9 pts)
```

## Score → model mapping

Provider-neutral. Recommend a model **class** — let the user pick the actual ID for their agent.

| Band | Score   | Recommendation                                                                                            |
| ---- | ------- | --------------------------------------------------------------------------------------------------------- |
| High | ≥ 80    | Frontier — Opus / GPT-5 / Gemini 2.5 Pro. Repo is well-prepped, the model can leverage it.                |
| Mid  | 60 – 79 | Standard — Sonnet / GPT-5 Codex / Gemini 2.5 Flash. Solid baseline; frontier optional.                    |
| Low  | < 60    | Small / fast — Haiku / GPT-4o-mini / Gemini 2.5 Flash-Lite. Repo lacks scaffolding for a frontier run.    |

The reasoning: a high-scoring repo has the scaffolding (AGENTS.md, fast tests, clear dev env) that lets a frontier model actually deliver. A low-scoring repo lacks those affordances; a frontier model's extra reasoning has nothing to grip on, so a smaller / faster model is the better trade.

## On first invocation

After the first successful run, mention to the user that they can wire the skill into a `SessionStart` hook so it fires automatically each session — pointing at the dashboard's `/skill` page for copy-paste snippets:

- **Claude Code** → `.claude/settings.json` `SessionStart` matcher.
- **Codex CLI** → `.codex/hooks.json` `SessionStart` matcher.
- **Cursor / Cline / Copilot** → no `SessionStart` event today; paste the same `node ... --summary` command into `.cursorrules` / `.clinerules` as a static instruction, or invoke this skill manually.

Snippets live at <https://www.agentfriendlycode.com/skill>.

## Failure modes

- **Bundle missing.** If `dist/index.js` doesn't exist next to this `SKILL.md`, the install was incomplete or the user is on an older skill version. Tell them to re-run `npx skills add hsnice16/agent-friendly-skill`.
- **Low score because cwd is a subdirectory.** The scorer reads the path you pass it (default: cwd). If the user is in a subdirectory of their project (e.g. `src/`), 16 signals will mostly fail because root-level files like `AGENTS.md`, `README.md`, `package.json` aren't there. If the score looks unexpectedly low, mention this and ask the user to invoke from the project root (or pass the root path explicitly).
- **Node not on PATH.** Tell the user to install Node ≥ 20.9.0 (matches the bundle's runtime requirement).

## Out of scope

- Scoring a remote URL, a different repo, or a package by name. This skill works on the active repo only. Direct the user to the dashboard at <https://www.agentfriendlycode.com> or its `/api/score?host=&repo=owner/name` endpoint for indexed lookups.
- Programmatic model switching. The skill recommends; the user runs `/model` (or the agent's equivalent) themselves.
- Submitting the repo to the dashboard. The skill is read-only — it never writes files, contacts the dashboard, or registers the repo. Unindexed repos stay unindexed.

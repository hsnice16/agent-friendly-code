# 0.9.3 — agent docs audit

**Status**: in_progress

Each agent's weights, rationale and read list re-checked against its docs and source on 2026-10-24. Cut as a patch so [0.10.0](../0.10.0/README.md) stays the maintainer opt-out and registry release.

## Owed a changelog line

- A seventeenth check, agent skills (`.agents/skills/<name>/SKILL.md`), counts for the seven agents that load that folder: Codex, Cursor, Devin, Gemini CLI, Kimi Code CLI, OpenHands and Pi.
- "GPT-5 Codex" is now "Codex" and "Kimi CLI" is "Kimi Code CLI", after the products' current names. Their URLs are unchanged.
- The AGENTS.md check also finds `.claude/CLAUDE.md` and `.claude/AGENTS.md`.
- The Cursor-rules check counts `.mdc` files in subfolders of `.cursor/rules/` and in `.cursor/rules/` folders up to three directories down, and counts a little for Devin, which pulls them into its Knowledge.
- A GEMINI.md that imports AGENTS.md with `@AGENTS.md` is measured with the imported text.
- The dev-env check accepts Devin's `.devin/blueprint.yaml` and Cursor's `.cursor/environment.json`.
- The Aider check no longer passes on `.aider.conf.yaml`, which Aider never loads, and gives full credit only to a config that sets `test-cmd`, `lint-cmd`, `auto-test` or `read`.
- /agents and the agent rationales on /methodology match each agent's current docs: Cursor, Devin, OpenHands and Pi read CLAUDE.md; Codex caps AGENTS.md at 32 KiB; OpenHands no longer always runs in a container.

## On deploy

Every repo needs a rescore for the new check and weights: run `scheduled-rescore.yml` via `workflow_dispatch`.

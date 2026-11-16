import type { ModelId } from "./scoring/weights";

// One line per agent for "if you use both", each a restatement of its
// AGENT_READS note (lib/agent-reads.ts), so it cites nothing new.
export const SETUP_TIP: Record<ModelId, string> = {
  "claude-code": "Claude Code: import `@AGENTS.md` in a CLAUDE.md; without that, a CLAUDE.md hides AGENTS.md from it.",
  cursor: "Cursor: put rules in `.cursor/rules/*.mdc`; a plain `.md` there is ignored. It reads AGENTS.md too.",
  "gpt-5-codex": "Codex: reads AGENTS.md before any work, up to 32 KiB combined across directories.",
  devin: "Devin: includes the first 16 KiB of AGENTS.md; `.devin/blueprint.yaml` can define its environment.",
  "kimi-cli": "Kimi Code CLI: reads AGENTS.md; its docs name no CLAUDE.md fallback.",
  openhands: "OpenHands: reads AGENTS.md and runs `.openhands/setup.sh` when it starts work on a repo.",
  pi: "Pi: loads the first of AGENTS.override.md, AGENTS.md and CLAUDE.md, so an empty AGENTS.md hides a CLAUDE.md.",
  "gemini-cli": "Gemini CLI: list AGENTS.md in the `context.fileName` setting, or keep a GEMINI.md.",
  aider: "Aider: list AGENTS.md under `read:` in `.aider.conf.yml`; it reads nothing else on its own.",
};

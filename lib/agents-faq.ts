import { AGENT_READS, type AgentsMdUse, OTHER_TOOLS } from "./agent-reads";
import { MODELS, type ModelId } from "./scoring/weights";

/** When the answers below were last read against each agent's docs. */
export const AGENT_DOCS_CHECKED = "2026-11-27";

// The answer opens with this so it can never disagree with AGENT_READS, which the table shows.
const LEAD: Record<AgentsMdUse, string> = {
  always: "Yes.",
  fallback: "Yes, when there is no CLAUDE.md.",
  setting: "Only when configured to.",
  no: "No.",
};

const DETAIL: Record<ModelId, string> = {
  "claude-code":
    "Claude Code v2.1.277 and later reads AGENTS.md and `.claude/AGENTS.md` by default, but only when no CLAUDE.md, `.claude/CLAUDE.md` or CLAUDE.local.md is in the working directory or above it. With both files, import `@AGENTS.md` in CLAUDE.md, or set Project instructions in `/config` to `claude-md-and-agents-md`. Run `/memory` to see what loaded.",
  "gpt-5-codex":
    "Codex reads AGENTS.md before any work, one per directory from the repo root down to the working directory, an AGENTS.override.md taking its place, up to 32 KiB combined. It reads CLAUDE.md only if `project_doc_fallback_filenames` lists it.",
  cursor:
    "Cursor reads AGENTS.md at the project root and in subdirectories, the more specific winning, and reads CLAUDE.md the same way (its docs describe one at the root). Its own project rules are `.mdc` files in `.cursor/rules/`.",
  devin:
    "Devin looks for AGENTS.md anywhere in the repo before it starts coding, and includes the first 16 KiB of each. It also pulls CLAUDE.md and Cursor rule files into its Knowledge, which its docs mark deprecated in favour of Skills.",
  "kimi-cli":
    "Kimi Code CLI reads AGENTS.md or `.kimi-code/AGENTS.md` from the project, and `/init` writes one. Its docs name no CLAUDE.md fallback.",
  openhands:
    "OpenHands reads AGENTS.md as repository context, and treats CLAUDE.md and GEMINI.md as context for Claude and Gemini models.",
  pi: "Pi loads AGENTS.md from the working directory and every directory above it. An AGENTS.override.md replaces it, and a CLAUDE.md is read where there is no AGENTS.md.",
  "gemini-cli":
    "Gemini CLI reads GEMINI.md by default. List AGENTS.md in `context.fileName` in `.gemini/settings.json`, or make GEMINI.md the line `@AGENTS.md`. Run `/memory show` to see what loaded.",
  aider:
    "Aider reads only the files you hand it: list AGENTS.md under `read:` in `.aider.conf.yml`, or pass `--read AGENTS.md`.",
};

export type Faq = { question: string; answer: string };

/** One "Does X read AGENTS.md?" per agent on the board, in MODELS order, then the tools off it. */
export function agentsMdFaq(): Faq[] {
  return [
    ...MODELS.map((m) => ({
      question: `Does ${m.label} read AGENTS.md?`,
      answer: `${LEAD[AGENT_READS[m.id].agentsMd]} ${DETAIL[m.id]}`,
    })),
    ...OTHER_TOOLS.map((t) => ({ question: `Does ${t.name} read AGENTS.md?`, answer: t.answer })),
  ];
}

/** For FAQPage JSON-LD, which takes plain text: the backticks are markup for CodeText. */
export function plainText(text: string): string {
  return text.replaceAll("`", "");
}

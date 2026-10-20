import { MODELS, type ModelId } from "./scoring/weights";

/**
 * How an agent treats AGENTS.md: "always" reads it, "fallback" only when its own
 * file is missing, "setting" only when configured to, "no" not at all.
 */
export type AgentsMdUse = "always" | "fallback" | "setting" | "no";

export type AgentReads = {
  /** Repo files the agent's docs say it reads, its own file first. */
  files: string[];
  agentsMd: AgentsMdUse;
  claudeMd: boolean;
  note: string;
  /** Docs for facts here that the weights' `sources` don't cover. */
  sources?: string[];
};

// Kept apart from weights.ts, which the skill and the action vendor: this is
// page copy, and every line is something the agent's docs state.
export const AGENT_READS: Record<ModelId, AgentReads> = {
  "claude-code": {
    files: ["CLAUDE.md", ".claude/CLAUDE.md", "CLAUDE.local.md", "AGENTS.md"],
    agentsMd: "fallback",
    claudeMd: true,
    note: "Reads AGENTS.md only when no CLAUDE.md is found (v2.1.277 and later). A CLAUDE.md that starts with `@AGENTS.md` loads both.",
  },
  "gpt-5-codex": {
    files: ["AGENTS.md", "AGENTS.override.md"],
    agentsMd: "always",
    claudeMd: false,
    note: "Reads AGENTS.md before any work, including one per directory; AGENTS.override.md takes precedence.",
  },
  cursor: {
    files: [".cursor/rules/*.mdc", "AGENTS.md", ".cursorrules"],
    agentsMd: "always",
    claudeMd: false,
    note: "Project rules live in `.cursor/rules/`; `.cursorrules` is the deprecated single-file form.",
  },
  devin: {
    files: ["AGENTS.md"],
    agentsMd: "always",
    claudeMd: false,
    note: "Looks for AGENTS.md before it starts coding and includes its first 16 KiB. Setup comes from its environment snapshot.",
    sources: ["https://docs.devin.ai/onboard-devin/agents-md"],
  },
  "kimi-cli": {
    files: ["AGENTS.md", ".kimi-code/AGENTS.md"],
    agentsMd: "always",
    claudeMd: false,
    note: "`/init` writes an AGENTS.md. Its docs name no CLAUDE.md fallback.",
  },
  openhands: {
    files: ["AGENTS.md", ".openhands/setup.sh", ".agents/skills/"],
    agentsMd: "always",
    claudeMd: false,
    note: "Runs `.openhands/setup.sh` in its sandbox when a session starts.",
  },
  pi: {
    files: ["AGENTS.md", "CLAUDE.md"],
    agentsMd: "always",
    claudeMd: true,
    note: "Loads either name from the working directory and every directory above it.",
  },
  "gemini-cli": {
    files: ["GEMINI.md"],
    agentsMd: "setting",
    claudeMd: false,
    note: "Reads GEMINI.md at every level from global to per-directory. AGENTS.md loads once it is listed in the `context.fileName` setting.",
  },
  aider: {
    files: [".aider.conf.yml"],
    agentsMd: "setting",
    claudeMd: false,
    note: "Reads AGENTS.md or CONVENTIONS.md only when `.aider.conf.yml` lists it under `read:`.",
  },
};

/** MODELS order, filtered to the agents that use AGENTS.md in the given way. */
export function agentsUsingAgentsMd(use: AgentsMdUse): string[] {
  return MODELS.filter((m) => AGENT_READS[m.id].agentsMd === use).map((m) => m.label);
}

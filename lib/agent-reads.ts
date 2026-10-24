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
    files: ["CLAUDE.md", ".claude/CLAUDE.md", ".claude/rules/", "CLAUDE.local.md", "AGENTS.md", ".claude/AGENTS.md"],
    agentsMd: "fallback",
    claudeMd: true,
    note: "Reads AGENTS.md only when no CLAUDE.md, `.claude/CLAUDE.md` or CLAUDE.local.md is found (v2.1.277 and later). A CLAUDE.md that starts with `@AGENTS.md` loads both, as does a setting.",
  },
  "gpt-5-codex": {
    files: ["AGENTS.md", "AGENTS.override.md", ".agents/skills/"],
    agentsMd: "always",
    claudeMd: false,
    note: "Reads AGENTS.md before any work, one per directory from the repo root down to the working directory, up to 32 KiB combined; AGENTS.override.md replaces the AGENTS.md beside it.",
  },
  cursor: {
    files: [".cursor/rules/*.mdc", "AGENTS.md", "CLAUDE.md", ".agents/skills/"],
    agentsMd: "always",
    claudeMd: true,
    note: "Project rules live in `.cursor/rules/`, subfolders included, and in a `.cursor/rules/` in any subdirectory; a plain `.md` there is ignored. The CLI also reads a root CLAUDE.md. Its current docs no longer mention `.cursorrules`.",
    sources: ["https://cursor.com/docs/cli/using", "https://cursor.com/docs/cli/changelog"],
  },
  devin: {
    files: ["AGENTS.md", "CLAUDE.md", ".cursor/rules/*.mdc", ".devin/blueprint.yaml", ".agents/skills/"],
    agentsMd: "always",
    claudeMd: true,
    note: "Looks for AGENTS.md before it starts coding and includes its first 16 KiB. Pulls CLAUDE.md and Cursor rule files into its Knowledge. Setup comes from its environment snapshot, which `.devin/blueprint.yaml` can define.",
    sources: [
      "https://docs.devin.ai/onboard-devin/agents-md",
      "https://docs.devin.ai/onboard-devin/environment/git-backed-blueprints",
    ],
  },
  "kimi-cli": {
    files: ["AGENTS.md", ".kimi-code/AGENTS.md", ".agents/skills/"],
    agentsMd: "always",
    claudeMd: false,
    note: "`/init` writes an AGENTS.md. Its docs name no CLAUDE.md fallback.",
  },
  openhands: {
    files: ["AGENTS.md", "CLAUDE.md", ".openhands/setup.sh", ".agents/skills/"],
    agentsMd: "always",
    claudeMd: true,
    note: "Runs `.openhands/setup.sh` when it starts work on a repo. Treats CLAUDE.md and GEMINI.md as model-specific context, for Claude and Gemini models.",
  },
  pi: {
    files: ["AGENTS.md", "CLAUDE.md", "AGENTS.override.md", ".agents/skills/"],
    agentsMd: "always",
    claudeMd: true,
    note: "Loads the first of AGENTS.override.md, AGENTS.md and CLAUDE.md from the working directory and every directory above it, so an empty AGENTS.md hides a CLAUDE.md beside it.",
  },
  "gemini-cli": {
    files: ["GEMINI.md", ".agents/skills/"],
    agentsMd: "setting",
    claudeMd: false,
    note: "Reads GEMINI.md from the global file, the workspace and its parent directories, and one per subdirectory once a tool reaches it. AGENTS.md loads once it is listed in the `context.fileName` setting.",
  },
  aider: {
    files: [".aider.conf.yml"],
    agentsMd: "setting",
    claudeMd: false,
    note: "Reads AGENTS.md or CONVENTIONS.md only when `.aider.conf.yml` lists it under `read:`. It does not look for `.aider.conf.yaml`.",
  },
};

/** MODELS order, filtered to the agents that use AGENTS.md in the given way. */
export function agentsUsingAgentsMd(use: AgentsMdUse): string[] {
  return MODELS.filter((m) => AGENT_READS[m.id].agentsMd === use).map((m) => m.label);
}

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
    files: [
      "CLAUDE.md",
      ".claude/CLAUDE.md",
      ".claude/rules/",
      "CLAUDE.local.md",
      "AGENTS.md",
      ".claude/AGENTS.md",
      ".claude/skills/",
    ],
    agentsMd: "fallback",
    claudeMd: true,
    note: "Reads AGENTS.md only when no CLAUDE.md, `.claude/CLAUDE.md` or CLAUDE.local.md is found (v2.1.277 and later). A CLAUDE.md that imports `@AGENTS.md` loads both, as does a setting.",
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
    note: "Project rules are `.mdc` files in `.cursor/rules/`, subfolders included; a plain `.md` there is ignored. AGENTS.md is read at the root and in subdirectories, combined, the more specific winning. CLAUDE.md is read the same way; the docs describe one at the root. A root `.cursorrules` is legacy and will be deprecated.",
    sources: [
      "https://cursor.com/docs/context/rules",
      "https://cursor.com/help/customization/rules",
      "https://cursor.com/docs/cli/using",
    ],
  },
  devin: {
    files: ["AGENTS.md", "CLAUDE.md", ".cursor/rules/*.mdc", ".devin/blueprint.yaml", ".agents/skills/"],
    agentsMd: "always",
    claudeMd: true,
    note: "Looks for AGENTS.md before it starts coding and includes its first 16 KiB. Pulls CLAUDE.md and Cursor rule files into its Knowledge. Setup comes from its environment snapshot, which `.devin/blueprint.yaml` can define.",
    sources: [
      "https://docs.devin.ai/onboard-devin/agents-md",
      "https://docs.devin.ai/onboard-devin/knowledge-onboarding",
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
    note: "Runs `.openhands/setup.sh` when it starts work on a repo. Treats CLAUDE.md and GEMINI.md as context for Claude and Gemini models.",
  },
  pi: {
    files: ["AGENTS.md", "CLAUDE.md", "AGENTS.override.md", ".agents/skills/"],
    agentsMd: "always",
    claudeMd: true,
    note: "Loads the first of AGENTS.override.md, AGENTS.md and CLAUDE.md from the working directory and every directory above it, so an empty AGENTS.md hides a CLAUDE.md beside it.",
    // The docs say only that the override wins; the order and the empty-file case are in the loader.
    sources: ["https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/resource-loader.ts"],
  },
  "gemini-cli": {
    files: ["GEMINI.md", ".agents/skills/"],
    agentsMd: "setting",
    claudeMd: false,
    note: "Reads GEMINI.md from the global file, the workspace and its parent directories, and one per subdirectory once a tool reaches it. AGENTS.md loads once listed in the `context.fileName` setting.",
  },
  aider: {
    files: [".aider.conf.yml"],
    agentsMd: "setting",
    claudeMd: false,
    note: "Reads AGENTS.md or CONVENTIONS.md only when `.aider.conf.yml` lists it under `read:`. Its docs name only `.aider.conf.yml`, never `.aider.conf.yaml`.",
  },
};

/** MODELS order, filtered to the agents that use AGENTS.md in the given way. */
export function agentsUsingAgentsMd(use: AgentsMdUse): string[] {
  return MODELS.filter((m) => AGENT_READS[m.id].agentsMd === use).map((m) => m.label);
}

/** MODELS order, filtered to the agents whose docs say they read the given repo file. */
export function agentsReading(file: string): string[] {
  return MODELS.filter((m) => AGENT_READS[m.id].files.includes(file)).map((m) => m.label);
}

/** A tool off the board: no score, so its answer is prose rather than an `AgentsMdUse`. */
export type OtherTool = {
  name: string;
  files: string[];
  /** The table's "AGENTS.md?" cell. */
  agentsMd: string;
  /** The FAQ answer to "Does <name> read AGENTS.md?". */
  answer: string;
  sources: string[];
};

// Searched-for tools we don't score yet. Same bar as AGENT_READS: the docs state every line.
export const OTHER_TOOLS: OtherTool[] = [
  {
    name: "GitHub Copilot",
    files: [
      ".github/copilot-instructions.md",
      ".github/instructions/*.instructions.md",
      "AGENTS.md",
      "CLAUDE.md",
      "GEMINI.md",
    ],
    agentsMd: "Cloud agent, code review, CLI and VS Code",
    answer:
      "On some surfaces. Copilot cloud agent, code review and CLI read AGENTS.md files anywhere in the repo, the nearest one taking precedence, or a single root CLAUDE.md or GEMINI.md instead. In VS Code, the Copilot harness finds AGENTS.md files the same way; the Local harness reads a root one only with `chat.useAgentsMdFile` on, and nested ones with the experimental `chat.useNestedAgentsMdFiles`. Copilot's own file, its CLAUDE.md equivalent, is `.github/copilot-instructions.md`, which every surface but Eclipse code review reads; the support matrix lists no AGENTS.md for chat in Visual Studio, JetBrains, Eclipse or Xcode.",
    sources: [
      "https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions",
      "https://docs.github.com/en/copilot/reference/custom-instructions-support",
      "https://code.visualstudio.com/docs/agents/reference/custom-instructions-reference",
    ],
  },
  {
    name: "Google Antigravity",
    files: ["AGENTS.md", "GEMINI.md", ".agents/AGENTS.md", ".agents/GEMINI.md", ".agents/rules/*.md"],
    agentsMd: "Yes, with GEMINI.md",
    answer:
      "Yes. Antigravity reads AGENTS.md or GEMINI.md, at the top of a folder or in its `.agents/`, plus `.agents/rules/*.md`, in the workspace folder and its parents up to the repo root, and combines every rule it finds. Subfolders below the workspace are not loaded, and each rule file is capped at 24,000 bytes.",
    sources: ["https://antigravity.google/docs/rules"],
  },
  {
    name: "OpenCode",
    files: ["AGENTS.md", "CLAUDE.md", "opencode.json"],
    agentsMd: "Yes, CLAUDE.md as fallback",
    answer:
      "Yes. OpenCode finds AGENTS.md by traversing up from the current directory, and uses a CLAUDE.md only if no AGENTS.md exists. The global file is `~/.config/opencode/AGENTS.md`. Other files, such as `packages/*/AGENTS.md` in a monorepo, go in the `instructions` list in `opencode.json`.",
    sources: ["https://opencode.ai/docs/rules/"],
  },
  {
    name: "Devin Desktop (formerly Windsurf)",
    files: [".devin/rules/*.md", ".devin/global_rules.md", "AGENTS.md", ".windsurf/rules/*.md", ".windsurfrules"],
    agentsMd: "Yes, always on",
    answer:
      "Yes. Windsurf became Devin Desktop on June 2, 2026, and treats AGENTS.md as an always-on rule, read in each directory from the workspace root down to the working directory. Its own rules go in `.devin/rules/*.md`; the legacy `.windsurf/rules/` and `.windsurfrules` are still read.",
    sources: ["https://docs.devin.ai/desktop/devin-desktop-faq", "https://docs.devin.ai/desktop/cascade/memories"],
  },
  {
    name: "Kiro",
    files: [".kiro/steering/*.md", "AGENTS.md"],
    agentsMd: "Yes, always included",
    answer:
      "Yes. Kiro reads AGENTS.md in the workspace root and subdirectories and always includes it. Its own steering files go in `.kiro/steering/`, with an inclusion mode in their frontmatter: `always`, `fileMatch`, `manual` or `auto`.",
    sources: ["https://kiro.dev/docs/steering/"],
  },
];

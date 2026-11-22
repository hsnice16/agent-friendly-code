import { AGENT_READS, type AgentsMdUse, OTHER_TOOLS, type OtherTool } from "./agent-reads";
import type { CensusSummary } from "./file-census-summary";
import { MODELS, type ModelId, type ModelProfile } from "./scoring/weights";

export type MatrixCell = "yes" | "fallback" | "setting" | null;

export type MatrixColumn = {
  label: string;
  /** Repos in the census with this file, of `CensusSummary.repos`. */
  repos: (c: CensusSummary) => number;
  /** Prefers the agent's doc whose URL contains this, for the cell's link. */
  doc?: string;
};

type Agent = { files: string[]; agentsMd: MatrixCell; claudeMd: boolean; nested: boolean };

export const MATRIX_COLUMNS: (MatrixColumn & { cell: (a: Agent) => MatrixCell })[] = [
  { label: "AGENTS.md", repos: (c) => c.rootAgentsMd, cell: (a) => a.agentsMd },
  { label: "AGENTS.md in subfolders", repos: (c) => c.nestedAgentsMd, cell: (a) => (a.nested ? "yes" : null) },
  { label: "CLAUDE.md", repos: (c) => c.anyClaudeMd, cell: (a) => (a.claudeMd ? "yes" : null) },
  { label: "GEMINI.md", repos: (c) => c.geminiMd, doc: "gemini", cell: has("GEMINI.md") },
  { label: ".github/copilot-instructions.md", repos: (c) => c.copilot, cell: has(".github/copilot-instructions.md") },
  { label: ".cursor/rules", repos: (c) => c.cursorRules, doc: "rules", cell: has(".cursor/rules/*.mdc") },
  { label: ".agents/skills", repos: (c) => c.skillsAgents, doc: "skill", cell: has(".agents/skills/") },
  { label: ".claude/skills", repos: (c) => c.skillsClaude, doc: "skill", cell: has(".claude/skills/") },
  { label: "llms.txt", repos: (c) => c.llmsTxt, cell: has("llms.txt") },
];

function has(file: string) {
  return (a: Agent): MatrixCell => (a.files.includes(file) ? "yes" : null);
}

// Agents whose note in agent-reads.ts says an AGENTS.md below the root is read
// when working there. Kept here rather than as a field: no other page needs it.
const NESTED = new Set<string>([
  "gpt-5-codex",
  "cursor",
  "pi",
  "GitHub Copilot",
  "Google Antigravity",
  "OpenCode",
  "Devin Desktop (formerly Windsurf)",
  "Kiro",
]);

const USE_CELL: Record<AgentsMdUse, MatrixCell> = { always: "yes", fallback: "fallback", setting: "setting", no: null };

export type MatrixRow = { label: string; modelId: ModelId | null; cells: { value: MatrixCell; doc: string | null }[] };

function pickDoc(sources: string[], hint: string | undefined): string | null {
  return (hint && sources.find((u) => u.toLowerCase().includes(hint))) || sources[0] || null;
}

function row(label: string, modelId: ModelId | null, agent: Agent, sources: string[]): MatrixRow {
  return {
    label,
    modelId,
    cells: MATRIX_COLUMNS.map((col) => {
      const value = col.cell(agent);
      return { value, doc: value ? pickDoc(sources, col.doc) : null };
    }),
  };
}

/** Every agent we score, then the tools we don't, each cell from what that agent's docs state. */
export function supportMatrix(models: ModelProfile[] = MODELS, others: OtherTool[] = OTHER_TOOLS): MatrixRow[] {
  return [
    ...models.map((m) => {
      const r = AGENT_READS[m.id];
      return row(
        m.label,
        m.id,
        { files: r.files, agentsMd: USE_CELL[r.agentsMd], claudeMd: r.claudeMd, nested: NESTED.has(m.id) },
        [...m.sources, ...(r.sources ?? [])],
      );
    }),
    ...others.map((t) =>
      row(
        t.name,
        null,
        {
          files: t.files,
          agentsMd: t.files.includes("AGENTS.md") ? "yes" : null,
          claudeMd: t.files.includes("CLAUDE.md"),
          nested: NESTED.has(t.name),
        },
        t.sources,
      ),
    ),
  ];
}

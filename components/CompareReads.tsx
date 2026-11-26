import { CodeText } from "@/components/CodeText";
import { CompareGrid } from "@/components/CompareGrid";
import { AGENT_READS, type AgentsMdUse } from "@/lib/agent-reads";
import type { ModelProfile } from "@/lib/scoring/weights";

const CODE = "font-mono text-[13px] text-ink";

const AGENTS_MD_USE: Record<AgentsMdUse, string> = {
  always: "Always",
  fallback: "Only when there is no CLAUDE.md",
  setting: "Only when configured to",
  no: "No",
};

type Row = { aspect: string; cell: (m: ModelProfile) => React.ReactNode };

const ROWS: Row[] = [
  {
    aspect: "Reads from the repo",
    cell: (m) => (
      <span className="flex flex-wrap gap-x-2 gap-y-0.5">
        {AGENT_READS[m.id].files.map((f) => (
          <code key={f} className={CODE}>
            {f}
          </code>
        ))}
      </span>
    ),
  },
  { aspect: "Reads AGENTS.md", cell: (m) => AGENTS_MD_USE[AGENT_READS[m.id].agentsMd] },
  { aspect: "Reads CLAUDE.md", cell: (m) => (AGENT_READS[m.id].claudeMd ? "Yes" : "No") },
  { aspect: "From its docs", cell: (m) => <CodeText text={AGENT_READS[m.id].note} /> },
];

export function CompareReads({ a, b, extra = [] }: { a: ModelProfile; b: ModelProfile; extra?: Row[] }) {
  return (
    <CompareGrid
      heads={[a.label, b.label]}
      rows={[...ROWS, ...extra].map((r) => ({ aspect: r.aspect, a: r.cell(a), b: r.cell(b) }))}
    />
  );
}

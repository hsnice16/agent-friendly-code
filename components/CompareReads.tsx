import { CodeText } from "@/components/CodeText";
import { AGENT_READS, type AgentsMdUse } from "@/lib/agent-reads";
import type { ModelProfile } from "@/lib/scoring/weights";

const COLS = "sm:grid-cols-[minmax(7rem,0.8fr)_1fr_1fr] sm:gap-x-4";
// Each cell's column name: shown when the row stacks, kept for screen readers once the header row shows.
const CELL_LABEL = "font-medium text-muted sm:sr-only";
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

/** A <dl>, not a table: below sm each row stacks, labelling its own cells, so no column clips on a phone. */
export function CompareReads({ a, b, extra = [] }: { a: ModelProfile; b: ModelProfile; extra?: Row[] }) {
  return (
    <>
      <div aria-hidden="true" className={`hidden border-b border-line py-2 text-[12.5px] text-muted sm:grid ${COLS}`}>
        <span />
        <span className="font-medium">{a.label}</span>
        <span className="font-medium">{b.label}</span>
      </div>
      <dl className="m-0 text-[14px]">
        {[...ROWS, ...extra].map((r) => (
          <div key={r.aspect} className={`grid gap-1 border-b border-line py-2.5 last:border-b-0 sm:gap-y-0 ${COLS}`}>
            <dt className="font-medium text-ink">{r.aspect}</dt>
            {[a, b].map((m) => (
              <dd key={m.id} className="m-0 text-ink-dim">
                <span className={CELL_LABEL}>{m.label}: </span>
                {r.cell(m)}
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </>
  );
}

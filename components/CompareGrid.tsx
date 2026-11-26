import type { ReactNode } from "react";

const COLS = "sm:grid-cols-[minmax(7rem,0.8fr)_1fr_1fr] sm:gap-x-4";
// Each cell's column name: shown when the row stacks, kept for screen readers once the header row shows.
const CELL_LABEL = "font-medium text-muted sm:sr-only";

export type CompareGridRow = { aspect: string; a: ReactNode; b: ReactNode };

/** A <dl>, not a table: below sm each row stacks, labelling its own cells, so no column clips on a phone. */
export function CompareGrid({ heads, rows }: { heads: [string, string]; rows: CompareGridRow[] }) {
  return (
    <>
      <div aria-hidden="true" className={`hidden border-b border-line py-2 text-[12.5px] text-muted sm:grid ${COLS}`}>
        <span />
        <span className="font-medium">{heads[0]}</span>
        <span className="font-medium">{heads[1]}</span>
      </div>
      <dl className="m-0 text-[14px]">
        {rows.map((r) => (
          <div key={r.aspect} className={`grid gap-1 border-b border-line py-2.5 last:border-b-0 sm:gap-y-0 ${COLS}`}>
            <dt className="font-medium text-ink">{r.aspect}</dt>
            <dd className="m-0 text-ink-dim">
              <span className={CELL_LABEL}>{heads[0]}: </span>
              {r.a}
            </dd>
            <dd className="m-0 text-ink-dim">
              <span className={CELL_LABEL}>{heads[1]}: </span>
              {r.b}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}

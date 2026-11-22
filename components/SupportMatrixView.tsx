"use client";

import type { MatrixCell } from "@/lib/agent-support-matrix";

import { IntentLink } from "./IntentLink";
import { LINK } from "./link-class";

export type Props = {
  columns: { label: string; share: string }[];
  /** Each distinct doc URL once; cells point into it, so the payload carries no URL twice. */
  docs: string[];
  rows: { label: string; href: string | null; cells: [MatrixCell, number][] }[];
  reposLabel: string;
};

const TEXT: Record<Exclude<MatrixCell, null>, string> = { yes: "Yes", fallback: "Fallback", setting: "Setting" };

// Client: see AGENTS.md → Conventions.
export function SupportMatrixView({ columns, docs, rows, reposLabel }: Props) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region
    <section className="table-wrap" tabIndex={0} aria-label="Which agents read which file">
      <table className="data-table min-w-[900px] text-[13.5px]">
        <caption className="sr-only">Instruction files each AI coding tool reads, per its docs</caption>
        <thead>
          <tr>
            <th scope="col">Agent</th>
            {columns.map((c) => (
              <th key={c.label} scope="col" className="normal-case font-mono text-[12px]">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row" className="font-medium">
                {r.href ? (
                  <IntentLink href={r.href} className={LINK}>
                    {r.label}
                  </IntentLink>
                ) : (
                  r.label
                )}
              </th>
              {r.cells.map(([value, doc], i) => (
                <td key={columns[i].label} className={value ? "" : "text-muted"}>
                  {value ? (
                    <a href={docs[doc]} target="_blank" rel="noopener noreferrer" className="prose-link">
                      {TEXT[value]}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="font-medium text-ink-dim">
              {reposLabel}
            </th>
            {columns.map((c) => (
              <td key={c.label} className="tabular-nums text-ink-dim">
                {c.share}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </section>
  );
}

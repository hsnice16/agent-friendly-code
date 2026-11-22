"use client";

import type { CheckPractice } from "@/lib/check-content/practice";
import { percent } from "@/lib/utils/format";

import { CodeText } from "./CodeText";
import { CopySnippet } from "./CopySnippet";
import { ExternalLink } from "./ExternalLink";
import { Panel, PanelHeading } from "./Panel";

function PracticeTable({ table }: { table: NonNullable<CheckPractice["table"]> }) {
  const [head, ...rows] = table.rows;
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region
    <section className="table-wrap mt-3" tabIndex={0} aria-label={table.caption}>
      <table className="data-table text-[13.5px]">
        <caption className="sr-only">{table.caption}</caption>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-ink-dim">
          {rows.map(([label, ...cells]) => (
            <tr key={label}>
              <th scope="row" className="font-medium">
                {label}
              </th>
              {cells.map((c, i) => (
                <td key={head[i + 1]}>
                  <CodeText text={c} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

// Client so the RSC payload carries this panel's strings, not its markup: the
// pre-commit one holds a table and four snippets.
export function CheckPracticePanelView({
  practice,
  sourceLabels,
  stats,
}: {
  practice: CheckPractice;
  sourceLabels: string[];
  stats: { full: number; total: number };
}) {
  const snippets = practice.snippets ?? [];
  return (
    <Panel>
      <PanelHeading>{practice.heading}</PanelHeading>
      <ul className="m-0 ml-5 list-disc text-[14.5px] leading-relaxed text-ink-dim">
        {practice.items.map((line) => (
          <li key={line}>
            <CodeText text={line} />
          </li>
        ))}
      </ul>
      {practice.table && <PracticeTable table={practice.table} />}
      {snippets.length > 0 && (
        <div className={`mt-3 grid grid-cols-1 gap-3 ${snippets.length > 1 ? "md:grid-cols-2" : ""}`}>
          {snippets.map((s) => (
            <div key={s.caption} className="min-w-0">
              <p className="m-0 mb-1.5 font-mono text-[12.5px] text-muted">{s.caption}</p>
              <CopySnippet text={s.text} label={s.caption} />
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 mb-0 text-[13px] text-muted">
        {stats.full} of {stats.total} leaderboard repos pass this check in full ({percent(stats.full, stats.total)}).
        Sources:{" "}
        {sourceLabels.map((label, i) => (
          <span key={practice.sources[i]}>
            {i > 0 && ", "}
            <ExternalLink href={practice.sources[i]}>{label}</ExternalLink>
          </span>
        ))}
        .
      </p>
    </Panel>
  );
}

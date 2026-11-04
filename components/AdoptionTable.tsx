import { type AdoptionPoint, monthlyPoints, SERIES_LABEL } from "@/lib/agents-md-adoption";
import { formatDay, percent } from "@/lib/utils/format";

const COLUMNS: { label: string; value: (p: AdoptionPoint) => number }[] = [
  { label: SERIES_LABEL.agentsMd, value: (p) => p.agentsMd },
  { label: SERIES_LABEL.claudeMd, value: (p) => p.claudeMd },
  { label: SERIES_LABEL.withFile, value: (p) => p.withFile },
];

/** The chart's accessible equivalent, a month at a time, newest first; every snapshot is in the CSV. */
export function AdoptionTable({ points, csvHref }: { points: AdoptionPoint[]; csvHref: string }) {
  return (
    <details className="mt-3 text-[13px] text-muted">
      <summary className="-my-2.5 cursor-pointer py-2.5">Numbers by month</summary>
      <section
        // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region
        tabIndex={0}
        aria-label="Numbers by month"
        className="mt-2 overflow-x-auto rounded-lg border border-line"
      >
        <table className="w-full border-collapse text-left text-[13px] tabular-nums">
          <caption className="sr-only">
            Repos with each agent instructions file: the first snapshot of each month, and the latest
          </caption>
          <thead className="bg-surface-2">
            <tr className="border-b border-line text-[12.5px] text-muted">
              <th scope="col" className="px-3 py-2 font-medium">
                Date
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                Repos
              </th>
              {COLUMNS.map((c) => (
                <th key={c.label} scope="col" className="px-3 py-2 text-right font-medium">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-ink-dim">
            {monthlyPoints(points)
              .reverse()
              .map((p) => (
                <tr key={p.date} className="border-b border-line last:border-b-0">
                  <th scope="row" className="whitespace-nowrap px-3 py-1.5 font-normal">
                    {formatDay(p.date)}
                  </th>
                  <td className="px-3 py-1.5 text-right">{p.repos}</td>
                  {COLUMNS.map((c) => (
                    <td key={c.label} className="whitespace-nowrap px-3 py-1.5 text-right">
                      {c.value(p)} <span className="text-muted">({percent(c.value(p), p.repos)})</span>
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </section>
      <p className="mt-2 mb-0">
        Every snapshot day:{" "}
        <a href={csvHref} download className="prose-link">
          the CSV
        </a>
        .
      </p>
    </details>
  );
}

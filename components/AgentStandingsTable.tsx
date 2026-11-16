import Link from "next/link";

import type { AgentStanding } from "@/lib/agent-scores";
import { modelPath } from "@/lib/utils/leaderboard-href";

import { LINK } from "./link-class";
import { ScoreNumber } from "./ScoreNumber";

export function AgentStandingsTable({ standings, label }: { standings: AgentStanding[]; label: string }) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region
    <section className="table-wrap" tabIndex={0} aria-label={`Agent scores of ${label} repos`}>
      <table className="data-table min-w-[420px] text-[14px]">
        <caption className="sr-only">Average and median score of {label} repos for each agent, highest first</caption>
        <thead>
          <tr>
            <th scope="col">Agent</th>
            <th scope="col" className="text-right">
              Average
            </th>
            <th scope="col" className="text-right">
              Median
            </th>
            <th scope="col" className="text-right">
              Top for
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => (
            <tr key={s.model.id}>
              <th scope="row" className="font-medium">
                <Link href={modelPath(s.model.id)} className={`${LINK} cover-link`}>
                  {s.model.label}
                </Link>
              </th>
              <td className="text-right">
                <ScoreNumber score={s.average} size="sm" />
              </td>
              <td className="text-right tabular-nums">{s.median == null ? "—" : s.median.toFixed(1)}</td>
              <td className="text-right tabular-nums">{s.top}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

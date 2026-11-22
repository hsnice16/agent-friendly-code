import { bestAgents, type ScoredRepo } from "@/lib/agent-scores";
import { compactStars } from "@/lib/utils/format";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { repoPath } from "@/lib/utils/repo-path";

import { IntentLink } from "./IntentLink";
import { LINK } from "./link-class";
import { ScoreNumber } from "./ScoreNumber";

export function RepoBestAgentTable({ rows, label }: { rows: ScoredRepo[]; label: string }) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region
    <section className="table-wrap" tabIndex={0} aria-label={`Top ${label} repos and their best agent`}>
      <table className="data-table min-w-[480px] text-[14px]">
        <caption className="sr-only">
          The highest-scoring {label} repos, overall, and the agent each is best set up for
        </caption>
        <thead>
          <tr>
            <th scope="col">Repo</th>
            <th scope="col" className="text-right">
              Overall
            </th>
            <th scope="col">Best set up for</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const best = bestAgents(r);
            const score = best[0] ? r.scores[best[0].id] : undefined;
            return (
              <tr key={r.id}>
                <th scope="row" className="font-medium">
                  <IntentLink href={repoPath(r)} className={`${LINK} cover-link`}>
                    {r.owner}/{r.name}
                  </IntentLink>
                  {r.stars != null && (
                    <span className="ml-1.5 text-[12px] font-normal text-muted">{compactStars(r.stars)}</span>
                  )}
                </th>
                <td className="text-right">
                  <ScoreNumber score={r.score ?? 0} size="sm" />
                </td>
                <td className="text-ink-dim">
                  {best.map((m, i) => (
                    <span key={m.id}>
                      {i > 0 && ", "}
                      <IntentLink href={modelPath(m.id)} className="prose-link">
                        {m.label}
                      </IntentLink>
                    </span>
                  ))}
                  {score != null && <span className="tabular-nums text-muted"> · {score.toFixed(1)}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

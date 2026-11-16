import Link from "next/link";

import type { PairGap } from "@/lib/agent-scores";
import { repoPath } from "@/lib/utils/repo-path";

export function ScoreGapList({ gaps, ahead, behind }: { gaps: PairGap[]; ahead: "a" | "b"; behind: string }) {
  if (gaps.length === 0) {
    return <p className="m-0 text-[14.5px] text-muted">None: no repo scores higher for it.</p>;
  }
  const other = ahead === "a" ? "b" : "a";
  return (
    <ol className="link-list">
      {gaps.map((g) => (
        <li key={g.repo.id} className="flex items-baseline justify-between gap-3 link-row">
          <Link href={repoPath(g.repo)} className="min-w-0 truncate font-medium ink-link cover-link">
            {g.repo.owner}/{g.repo.name}
          </Link>
          <span className="shrink-0 tabular-nums">
            <strong className="text-ink">{g[ahead].toFixed(1)}</strong>
            <span className="text-muted">
              {" "}
              vs {g[other].toFixed(1)}
              <span className="sr-only"> for {behind}</span>
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

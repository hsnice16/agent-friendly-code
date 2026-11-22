import { LEADER_QUALIFIER } from "@/lib/leaderboard-meta";
import type { LeaderboardRow } from "@/lib/types/db";
import { repoPath } from "@/lib/utils/repo-path";

import { IntentLink } from "./IntentLink";

/** `leaderSentence` with the repo linked, for a page lead. */
export function LeaderClause({ top }: { top: Pick<LeaderboardRow, "host" | "owner" | "name" | "score"> }) {
  return (
    <>
      {" "}
      {LEADER_QUALIFIER}:{" "}
      <IntentLink href={repoPath(top)} className="prose-link">
        {top.owner}/{top.name}
      </IntentLink>{" "}
      (<strong className="text-ink">{(top.score ?? 0).toFixed(1)}</strong>).
    </>
  );
}

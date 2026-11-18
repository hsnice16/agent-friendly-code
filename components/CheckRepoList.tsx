import type { LeaderboardRow } from "@/lib/types/db";

import { CheckRepoListView } from "./CheckRepoListView";

/** Whole board rows are cut to the tile's fields: every prop of the client view ships in the payload. */
export function CheckRepoList({ rows }: { rows: LeaderboardRow[] }) {
  const slim = rows.map((r) => ({
    id: r.id,
    host: r.host,
    owner: r.owner,
    name: r.name,
    score: r.score,
    language: r.language,
    stars: r.stars,
  }));

  return <CheckRepoListView rows={slim} />;
}

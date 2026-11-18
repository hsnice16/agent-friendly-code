import type { ComponentProps } from "react";

import type { BoardRow } from "@/lib/board";

import { LeaderboardTableClient } from "./LeaderboardTableClient";

type Props = Omit<ComponentProps<typeof LeaderboardTableClient>, "rows" | "onClearSearch" | "onClearBadge"> & {
  rows: (Omit<BoardRow, "id" | "description"> & { description?: string | null; rank?: number })[];
};

/** The board table for a hub page, fed only the fields a row renders: every prop ships in the payload. */
export function HubLeaderboardTable({ rows, ...rest }: Props) {
  const slim = rows.map((r) => ({
    host: r.host,
    owner: r.owner,
    name: r.name,
    url: r.url,
    stars: r.stars,
    badge_embedded: r.badge_embedded,
    description: r.description ?? null,
    score: r.score,
    ...(r.rank !== undefined ? { rank: r.rank } : {}),
  }));

  return <LeaderboardTableClient rows={slim} {...rest} />;
}

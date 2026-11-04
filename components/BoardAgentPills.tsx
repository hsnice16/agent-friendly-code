import Link from "next/link";
import { memo } from "react";

import { type BoardQuery, isRecut } from "@/lib/board";
import type { ModelId } from "@/lib/scoring/weights";
import { leaderboardHref } from "@/lib/utils/leaderboard-href";
import { pillClass } from "./pill-class";

type BoardId = ModelId | "overall";

type Props = {
  agents: { id: BoardId; label: string }[];
  selected: BoardId;
  /** Each pill keeps the current search, filter and sort. */
  query: BoardQuery;
};

/**
 * ModelPills for the board, fed labels by the server so the client bundle
 * skips the weights. Memoized: the board re-renders on every keystroke.
 */
export const BoardAgentPills = memo(function BoardAgentPills({ agents, selected, query }: Props) {
  // A re-cut address changes with every keystroke; only the plain boards are worth fetching ahead.
  const prefetch = !isRecut(query);
  return (
    <nav aria-label="Pick an AI agent" className="mb-4 flex flex-wrap gap-2">
      {agents.map((a) => (
        <Link
          key={a.id}
          href={leaderboardHref({ ...query, model: a.id, page: 1 })}
          prefetch={prefetch ? undefined : false}
          aria-current={selected === a.id ? "true" : undefined}
          className={pillClass(selected === a.id)}
        >
          {a.label}
        </Link>
      ))}
    </nav>
  );
});

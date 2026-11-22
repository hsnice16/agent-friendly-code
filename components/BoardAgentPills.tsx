import Link from "next/link";
import { type ComponentProps, memo } from "react";

import { type BoardQuery, isRecut } from "@/lib/board";
import type { ModelId } from "@/lib/scoring/weights";
import { leaderboardHref } from "@/lib/utils/leaderboard-href";

import { IntentLink } from "./IntentLink";
import { pillClass } from "./pill-class";

type BoardId = ModelId | "overall";

function NoPrefetchLink(props: Omit<ComponentProps<typeof Link>, "prefetch">) {
  return <Link {...props} prefetch={false} />;
}

type Props = {
  agents: { id: BoardId; label: string }[];
  selected: BoardId;
  /** Each pill keeps the current search, filter and sort. */
  query: BoardQuery;
};

/**
 * Agent pills fed labels by the server, so the client bundle skips the
 * weights. Memoized: the board re-renders on every keystroke.
 */
export const BoardAgentPills = memo(function BoardAgentPills({ agents, selected, query }: Props) {
  // A re-cut address changes with every keystroke; only the plain boards are
  // worth fetching ahead, and only on intent: in the viewport every pill fetched
  // another whole board.
  const Pill = isRecut(query) ? NoPrefetchLink : IntentLink;
  return (
    <nav aria-label="Pick an AI agent" className="mb-4 flex flex-wrap gap-2">
      {agents.map((a) => (
        <Pill
          key={a.id}
          href={leaderboardHref({ ...query, model: a.id, page: 1 })}
          aria-current={selected === a.id ? "true" : undefined}
          className={pillClass(selected === a.id)}
        >
          {a.label}
        </Pill>
      ))}
    </nav>
  );
});

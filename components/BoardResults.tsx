"use client";

import { type MouseEvent, memo, type ReactNode } from "react";

import type { BoardQuery, BoardView } from "@/lib/board";
import type { ModelId } from "@/lib/scoring/weights";
import { leaderboardHref } from "@/lib/utils/leaderboard-href";

import { BoardNotice } from "./BoardNotice";
import { LeaderboardTable } from "./LeaderboardTable";
import { Pagination } from "./Pagination";

type Props = {
  model: ModelId | "overall";
  /** The query the rows were cut for. */
  query: BoardQuery;
  view: Omit<BoardView, "total">;
  activeLabel: string;
  summary: ReactNode;
  busy: boolean;
  loading: boolean;
  notice: "stale" | "error" | null;
  onClearSearch: () => void;
  onClearBadge: () => void;
  onPageClick: (page: number, e: MouseEvent) => void;
};

/**
 * Memoized so a keystroke or an opened menu re-renders only the toolbar; the
 * rows follow in a transition. Every prop must stay referentially stable
 * between renders for that to hold.
 */
export const BoardResults = memo(function BoardResults({
  model,
  query,
  view,
  activeLabel,
  summary,
  busy,
  loading,
  notice,
  onClearSearch,
  onClearBadge,
  onPageClick,
}: Props) {
  return (
    <>
      <LeaderboardTable
        q={query.q}
        host={query.host}
        badge={query.badge}
        page={view.page}
        rows={view.rows}
        startIdx={view.startIdx}
        totalPages={view.totalPages}
        activeLabel={activeLabel}
        clearSearchHref={leaderboardHref({ ...query, model, q: "", page: 1 })}
        onClearSearch={onClearSearch}
        clearBadgeHref={leaderboardHref({ ...query, model, badge: false, page: 1 })}
        onClearBadge={onClearBadge}
        busy={busy}
        loading={loading}
        notice={notice && <BoardNotice reason={notice} />}
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {summary}

        <div data-board-pager className={notice || view.rows.length === 0 ? "invisible" : undefined}>
          <Pagination
            page={view.page}
            size="compact"
            totalPages={view.totalPages}
            label="Leaderboard pages"
            hrefFor={(p) => leaderboardHref({ ...query, model, page: p })}
            onPageClick={onPageClick}
          />
        </div>
      </div>
    </>
  );
});

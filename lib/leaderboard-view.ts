import { cache } from "react";

import { type Host, isHost } from "@/lib/constants/hosts";
import { LEADERBOARD_PAGE_SIZE, MAX_SEARCH_LENGTH } from "@/lib/constants/scoring";
import { DEFAULT_DIR, DEFAULT_SORT, isSortDir, isSortKey, type SortDir, type SortKey } from "@/lib/constants/sort";
import { listLeaderboard } from "@/lib/db";
import type { ModelId } from "@/lib/scoring/weights";
import type { LeaderboardRow } from "@/lib/types/db";

export type LeaderboardSearchParams = {
  q?: string;
  dir?: string;
  host?: string;
  page?: string;
  sort?: string;
};

export type LeaderboardView = {
  q: string;
  page: number;
  totalPages: number;
  dir: SortDir;
  sort: SortKey;
  host: Host | "all";
  model: ModelId | "overall";
  /** A re-cut of the board (host, search, sort) rather than the board itself. */
  filtered: boolean;
  filteredRows: LeaderboardRow[];
};

function matchesQuery(row: LeaderboardRow, q: string): boolean {
  return `${row.owner}/${row.name}`.toLowerCase().includes(q.trim().toLowerCase());
}

// Shared by generateMetadata and the page body, which run in one request
// scope — without this the whole board is queried and filtered twice.
export const resolveLeaderboardView = cache(
  (model: ModelId | "overall", sp: LeaderboardSearchParams): LeaderboardView => {
    const q = (sp.q ?? "").slice(0, MAX_SEARCH_LENGTH);
    const host: Host | "all" = isHost(sp.host) ? sp.host : "all";
    const dir: SortDir = isSortDir(sp.dir) ? sp.dir : DEFAULT_DIR;
    const sort: SortKey = isSortKey(sp.sort) ? sp.sort : DEFAULT_SORT;

    const baseRows = listLeaderboard({
      dir,
      sort,
      model,
      host: host === "all" ? undefined : host,
    });

    const filteredRows = q ? baseRows.filter((r) => matchesQuery(r, q)) : baseRows;
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / LEADERBOARD_PAGE_SIZE));

    // Out-of-range clamps rather than 404s, so a stale or hand-typed page number
    // still lands on rows; the canonical folds it onto the page it shows.
    const parsedPage = Number(sp.page);
    const page = Number.isFinite(parsedPage) ? Math.min(totalPages, Math.max(1, Math.floor(parsedPage))) : 1;

    const filtered = host !== "all" || q !== "" || sort !== DEFAULT_SORT || dir !== DEFAULT_DIR;

    return { q, page, totalPages, dir, sort, host, model, filtered, filteredRows };
  },
);

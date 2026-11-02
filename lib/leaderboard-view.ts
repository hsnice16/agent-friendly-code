import { cache } from "react";

import { pageSlice } from "@/lib/board";
import { listLeaderboard } from "@/lib/db";
import type { ModelId } from "@/lib/scoring/weights";
import type { LeaderboardRow } from "@/lib/types/db";

/** A prerendered board page. Search, filters and sorting happen in the browser (components/BoardClient.tsx). */
export type LeaderboardView = {
  model: ModelId | "overall";
  page: number;
  totalPages: number;
  /** The whole board in rank order; the page shows a slice of it. */
  allRows: LeaderboardRow[];
};

// Shared by generateMetadata and the page body. React's cache compares
// arguments by identity, so they stay primitives.
export const resolveLeaderboardView = cache((model: ModelId | "overall", page = 1): LeaderboardView => {
  const allRows = listLeaderboard({ model });
  const slice = pageSlice(allRows.length, page);
  return { model, page: slice.page, totalPages: slice.totalPages, allRows };
});

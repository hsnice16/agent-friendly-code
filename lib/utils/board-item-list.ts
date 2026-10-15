import { LEADERBOARD_PAGE_SIZE } from "@/lib/constants/scoring";
import type { LeaderboardView } from "@/lib/leaderboard-view";
import type { LeaderboardRow } from "@/lib/types/db";
import { repoPath } from "@/lib/utils/repo-path";
import { APP_URL } from "@/lib/version";

type PageParts = Pick<LeaderboardView, "page" | "filteredRows">;

export function boardPage({ page, filteredRows }: PageParts): { startIdx: number; rows: LeaderboardRow[] } {
  const startIdx = (page - 1) * LEADERBOARD_PAGE_SIZE;
  return { startIdx, rows: filteredRows.slice(startIdx, startIdx + LEADERBOARD_PAGE_SIZE) };
}

/**
 * The rows on this page, not the whole board: structured data has to describe
 * what the page shows. Null on a filtered view, which is noindex and a re-cut
 * of rows the unfiltered pages already list.
 */
export function boardItemList(view: PageParts & Pick<LeaderboardView, "filtered">, name: string) {
  if (view.filtered) {
    return null;
  }
  const { startIdx, rows } = boardPage(view);
  return rowsItemList(rows, name, startIdx);
}

export function rowsItemList(rows: LeaderboardRow[], name: string, startIdx = 0) {
  return {
    "@type": "ItemList",
    name,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: rows.length,
    itemListElement: rows.map((row, i) => ({
      "@type": "ListItem",
      position: startIdx + i + 1,
      name: `${row.owner}/${row.name}`,
      url: `${APP_URL}${repoPath(row)}`,
    })),
  };
}

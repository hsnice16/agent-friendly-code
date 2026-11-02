import { notFound } from "next/navigation";

import { type LeaderboardView, resolveLeaderboardView } from "@/lib/leaderboard-view";
import type { ModelId } from "@/lib/scoring/weights";

/** `/page/N` for every page after the first; page 1 is the board's own path. */
export function pageNumbers(model: ModelId | "overall"): string[] {
  const { totalPages } = resolveLeaderboardView(model);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => String(i + 2));
}

/** The view for a prerendered `/page/<n>`; the routes refuse every other `n`. */
export function pageView(model: ModelId | "overall", n: string): LeaderboardView {
  const view = resolveLeaderboardView(model, Number(n));
  if (String(view.page) !== n || view.page < 2) notFound();
  return view;
}

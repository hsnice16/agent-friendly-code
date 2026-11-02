import type { Metadata } from "next";

import { HomeLeaderboard } from "@/components/HomeLeaderboard";
import { getLeaderboardStats } from "@/lib/db";
import { leaderboardMetadata } from "@/lib/leaderboard-meta";
import { resolveLeaderboardView } from "@/lib/leaderboard-view";

// Search, filters and sorting run in the browser (components/BoardClient.tsx),
// so the board is the same for everyone until the next deploy and is prerendered.
export function generateMetadata(): Metadata {
  return leaderboardMetadata(resolveLeaderboardView("overall"));
}

export default function Page() {
  return <HomeLeaderboard stats={getLeaderboardStats()} view={resolveLeaderboardView("overall")} />;
}

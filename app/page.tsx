import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

import { HomeLeaderboard } from "@/components/HomeLeaderboard";
import { getLeaderboardStats } from "@/lib/db";
import { leaderboardMetadata } from "@/lib/leaderboard-meta";
import { type LeaderboardSearchParams, resolveLeaderboardView } from "@/lib/leaderboard-view";
import { isModelId, leaderboardHref } from "@/lib/utils/leaderboard-href";

type SearchParams = LeaderboardSearchParams & { model?: string | string[] };

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  return leaderboardMetadata(resolveLeaderboardView("overall", await searchParams));
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  // An agent's board used to be `/?model=<id>`; those links are still out there.
  const model = Array.isArray(sp.model) ? sp.model[0] : sp.model;
  if (isModelId(model)) {
    permanentRedirect(leaderboardHref(resolveLeaderboardView(model, sp)));
  }

  return <HomeLeaderboard stats={getLeaderboardStats()} view={resolveLeaderboardView("overall", sp)} />;
}

import type { Metadata } from "next";

import { HomeLeaderboard } from "@/components/HomeLeaderboard";
import { pageNumbers, pageView } from "@/lib/board-pages";
import { getLeaderboardStats } from "@/lib/db";
import { leaderboardMetadata } from "@/lib/leaderboard-meta";

// Only the pages the board has: rendering any other number on demand would let
// a crawler mint a cached page per number.
export const dynamicParams = false;

type Props = { params: Promise<{ n: string }> };

export function generateStaticParams() {
  return pageNumbers("overall").map((n) => ({ n }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return leaderboardMetadata(pageView("overall", (await params).n));
}

export default async function BoardPage({ params }: Props) {
  return <HomeLeaderboard stats={getLeaderboardStats()} view={pageView("overall", (await params).n)} />;
}

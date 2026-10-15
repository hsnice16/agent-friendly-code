import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ModelLeaderboard } from "@/components/ModelLeaderboard";
import { getLeaderboardStats } from "@/lib/db";
import { getModelPanel } from "@/lib/leaderboard-files";
import { leaderboardMetadata } from "@/lib/leaderboard-meta";
import { type LeaderboardSearchParams, resolveLeaderboardView } from "@/lib/leaderboard-view";
import { MODEL_BY_ID } from "@/lib/scoring/weights";
import { isModelId } from "@/lib/utils/leaderboard-href";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<LeaderboardSearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  return isModelId(slug) ? leaderboardMetadata(resolveLeaderboardView(slug, await searchParams)) : {};
}

export default async function ModelPage({ params, searchParams }: Props) {
  const { slug } = await params;
  if (!isModelId(slug)) {
    notFound();
  }

  return (
    <ModelLeaderboard
      model={slug}
      view={resolveLeaderboardView(slug, await searchParams)}
      stats={getLeaderboardStats()}
      panel={getModelPanel(MODEL_BY_ID[slug])}
    />
  );
}

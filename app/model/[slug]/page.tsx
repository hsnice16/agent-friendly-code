import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ModelLeaderboard } from "@/components/ModelLeaderboard";
import { getLeaderboardStats } from "@/lib/db";
import { getModelPanel } from "@/lib/leaderboard-files";
import { leaderboardMetadata } from "@/lib/leaderboard-meta";
import { resolveLeaderboardView } from "@/lib/leaderboard-view";
import { MODEL_BY_ID, MODELS } from "@/lib/scoring/weights";
import { isModelId } from "@/lib/utils/model-id";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return MODELS.map((m) => ({ slug: m.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return isModelId(slug) ? leaderboardMetadata(resolveLeaderboardView(slug)) : {};
}

export default async function ModelPage({ params }: Props) {
  const { slug } = await params;
  if (!isModelId(slug)) {
    notFound();
  }

  return (
    <ModelLeaderboard
      model={slug}
      view={resolveLeaderboardView(slug)}
      stats={getLeaderboardStats()}
      panel={getModelPanel(MODEL_BY_ID[slug])}
    />
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ModelLeaderboard } from "@/components/ModelLeaderboard";
import { pageNumbers, pageView } from "@/lib/board-pages";
import { getLeaderboardStats } from "@/lib/db";
import { getModelPanel } from "@/lib/leaderboard-files";
import { leaderboardMetadata } from "@/lib/leaderboard-meta";
import { MODEL_BY_ID, MODELS } from "@/lib/scoring/weights";
import { isModelId } from "@/lib/utils/model-id";

// Only the pages the board has: rendering any other number on demand would let
// a crawler mint a cached page per number.
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string; n: string }> };

export function generateStaticParams() {
  return MODELS.flatMap((m) => pageNumbers(m.id).map((n) => ({ slug: m.id, n })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, n } = await params;
  return isModelId(slug) ? leaderboardMetadata(pageView(slug, n)) : {};
}

export default async function ModelBoardPage({ params }: Props) {
  const { slug, n } = await params;
  if (!isModelId(slug)) {
    notFound();
  }

  return (
    <ModelLeaderboard
      model={slug}
      view={pageView(slug, n)}
      stats={getLeaderboardStats()}
      panel={getModelPanel(MODEL_BY_ID[slug])}
    />
  );
}

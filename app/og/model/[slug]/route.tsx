import { notFound } from "next/navigation";

import { boardLeader, leaderSentence } from "@/lib/leaderboard-meta";
import { resolveLeaderboardView } from "@/lib/leaderboard-view";
import { ogCard, ogSiteUrl } from "@/lib/og-card";
import { MODEL_BY_ID, MODELS } from "@/lib/scoring/weights";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { isModelId } from "@/lib/utils/model-id";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return MODELS.map((m) => ({ slug: m.id }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isModelId(slug)) {
    notFound();
  }

  const { label } = MODEL_BY_ID[slug];
  const rows = resolveLeaderboardView(slug).allRows;
  const top = boardLeader(rows);

  return ogCard({
    heading: [`Best GitHub repos for ${label}`, "ranked leaderboard"],
    sub: top ? `By their ${label} score. ${leaderSentence(top)}` : `By their ${label} score.`,
    footerLeft: `${rows.length} repos scored for ${label}`,
    footerRight: ogSiteUrl(modelPath(slug)),
  });
}

import { notFound } from "next/navigation";

import { resolveLeaderboardView } from "@/lib/leaderboard-view";
import { ogCard, ogSiteUrl } from "@/lib/og-card";
import { MODEL_BY_ID, MODELS } from "@/lib/scoring/weights";
import { isModelId, modelPath } from "@/lib/utils/leaderboard-href";

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
  const rows = resolveLeaderboardView(slug, {}).filteredRows;
  const top = rows[0];

  return ogCard({
    heading: [`Best repos for ${label}`, "ranked by agent readiness"],
    sub: top
      ? `By their ${label} score. ${top.owner}/${top.name} leads with ${(top.score ?? 0).toFixed(1)}.`
      : `By their ${label} score.`,
    footerLeft: `${rows.length} repos scored for ${label}`,
    footerRight: ogSiteUrl(modelPath(slug)),
  });
}

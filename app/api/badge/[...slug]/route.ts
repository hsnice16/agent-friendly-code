import { getModelScores, getRepoByHostOwnerName } from "@/lib/db";
import { MODEL_BY_ID } from "@/lib/scoring/weights";
import { badgeSvg } from "@/lib/utils/badge";
import { isModelId } from "@/lib/utils/leaderboard-href";
import { repoIdentity } from "@/lib/utils/repo-path";

export const dynamic = "force-dynamic";

const HEADERS = {
  "Content-Type": "image/svg+xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
};

export async function GET(req: Request, ctx: { params: Promise<{ slug: string[] }> }) {
  const identity = repoIdentity((await ctx.params).slug);

  const url = new URL(req.url);
  const modelParam = url.searchParams.get("model");

  const repo = identity && getRepoByHostOwnerName(identity.host, identity.owner, identity.name.replace(/\.svg$/i, ""));
  if (!repo) {
    return new Response(badgeSvg("agent friendly", "not scored", null), {
      headers: HEADERS,
    });
  }

  let label = "agent friendly";
  let score = repo.overall_score;

  if (isModelId(modelParam)) {
    const ms = getModelScores(repo.id).find((s) => s.modelId === modelParam);

    score = ms ? ms.score : null;
    label = `agent friendly · ${MODEL_BY_ID[modelParam].label.toLowerCase()}`;
  }

  const value = score == null ? "—" : score.toFixed(1);
  return new Response(badgeSvg(label, value, score), { headers: HEADERS });
}

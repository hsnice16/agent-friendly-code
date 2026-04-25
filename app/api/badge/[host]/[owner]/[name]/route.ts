import { getModelScores, getRepoByHostOwnerName } from "@/lib/db";
import { MODEL_BY_ID, type ModelId } from "@/lib/scoring/weights";
import { badgeSvg } from "@/lib/utils/badge";

export const dynamic = "force-dynamic";

const HEADERS = {
  "Content-Type": "image/svg+xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
};

export async function GET(req: Request, ctx: { params: Promise<{ host: string; owner: string; name: string }> }) {
  const { host, owner, name: rawName } = await ctx.params;
  const name = rawName.replace(/\.svg$/i, "");

  const url = new URL(req.url);
  const modelParam = url.searchParams.get("model");

  const repo = getRepoByHostOwnerName(host, owner, name);
  if (!repo) {
    return new Response(badgeSvg("agent friendly", "not scored", null), {
      headers: HEADERS,
    });
  }

  let label = "agent friendly";
  let score = repo.overall_score;

  if (modelParam && modelParam in MODEL_BY_ID) {
    const m = modelParam as ModelId;
    const ms = getModelScores(repo.id).find((s) => s.modelId === m);

    score = ms ? ms.score : null;
    label = `agent friendly · ${MODEL_BY_ID[m].label.toLowerCase()}`;
  }

  const value = score == null ? "—" : score.toFixed(1);
  return new Response(badgeSvg(label, value, score), { headers: HEADERS });
}

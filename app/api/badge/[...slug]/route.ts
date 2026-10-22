import { getModelScores, getRepoByHostOwnerName } from "@/lib/db";
import { cachedLiveScore, parseLiveTarget } from "@/lib/live-score/cached";
import { SUPPORTED_HOSTS } from "@/lib/live-score/supported";
import { MODEL_BY_ID } from "@/lib/scoring/weights";
import { badgeSvg } from "@/lib/utils/badge";
import { isModelId } from "@/lib/utils/leaderboard-href";
import { repoIdentity } from "@/lib/utils/repo-path";

export const dynamic = "force-dynamic";

// A badge for a repo off the board is scored live, and a cold score can take this long.
export const maxDuration = 60;

const HEADERS = {
  "Content-Type": "image/svg+xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
};

// A failed live score is a rate limit or host blip, not a verdict: README
// proxies would otherwise pin "not scored" for the full hour.
const RETRY_HEADERS = { ...HEADERS, "Cache-Control": "public, max-age=60, s-maxage=60" };
const FAILED = Symbol("failed");

type Scores = { overall: number | null; byModel: () => { modelId: string; score: number }[] };

// Live Score offers this badge, so a repo that isn't on the board would
// otherwise print "not scored" in the README it was just pasted into.
async function scoresFor(host: string, owner: string, name: string): Promise<Scores | null | typeof FAILED> {
  const repo = getRepoByHostOwnerName(host, owner, name);
  if (repo) return { overall: repo.overall_score, byModel: () => getModelScores(repo.id) };

  const parsed = parseLiveTarget({ host, owner, name });
  if (!parsed || !SUPPORTED_HOSTS.includes(parsed.host)) return null;

  const live = await cachedLiveScore(parsed).catch((): typeof FAILED => FAILED);
  if (live === FAILED) return FAILED;
  return live && { overall: live.overall, byModel: () => live.modelScores };
}

export async function GET(req: Request, ctx: { params: Promise<{ slug: string[] }> }) {
  const identity = repoIdentity((await ctx.params).slug);

  const url = new URL(req.url);
  const modelParam = url.searchParams.get("model");

  const scores = identity && (await scoresFor(identity.host, identity.owner, identity.name.replace(/\.svg$/i, "")));
  if (!scores || scores === FAILED) {
    return new Response(badgeSvg("agent friendly", "not scored", null), {
      headers: scores === FAILED ? RETRY_HEADERS : HEADERS,
    });
  }

  let label = "agent friendly";
  let score = scores.overall;

  if (isModelId(modelParam)) {
    const ms = scores.byModel().find((s) => s.modelId === modelParam);

    score = ms ? ms.score : null;
    label = `agent friendly · ${MODEL_BY_ID[modelParam].label.toLowerCase()}`;
  }

  const value = score == null ? "—" : score.toFixed(1);
  return new Response(badgeSvg(label, value, score), { headers: HEADERS });
}

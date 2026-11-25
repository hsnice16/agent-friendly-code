import { notFound } from "next/navigation";

import { LIVE_CACHE_CONTROL } from "@/lib/constants/cache";
import { cachedLiveScore, type LiveTarget, parseLiveTarget } from "@/lib/live-score/cached";
import { SUPPORTED_HOSTS } from "@/lib/live-score/supported";
import { repoScoreCard } from "@/lib/og-card";
import { hostLabel } from "@/lib/utils/format";

// Outside /score/ for the reason app/og/score/route.tsx gives. A cold card scores the repo, same as its page.
export const maxDuration = 60;

export async function GET(_request: Request, { params }: { params: Promise<LiveTarget> }) {
  const target = await params;
  const parsed = parseLiveTarget(target);
  if (!parsed || !SUPPORTED_HOSTS.includes(parsed.host)) {
    notFound();
  }

  // Too large, private, missing or a host blip: the page explains those, and
  // a share card has nothing true to print.
  const score = await cachedLiveScore(parsed).catch(() => null);
  if (!score) {
    notFound();
  }

  const card = repoScoreCard({
    slug: `${target.owner}/${target.name}`,
    score: score.overall.toFixed(1),
    context: [hostLabel(target.host), score.language],
  });
  // Every chat app a link is pasted into fetches the card, so it keeps the page's hour.
  card.headers.set("Cache-Control", LIVE_CACHE_CONTROL);
  return card;
}

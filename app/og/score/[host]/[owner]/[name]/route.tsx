import { notFound } from "next/navigation";

import { cachedLiveScore, type LiveTarget, parseLiveTarget } from "@/lib/live-score/cached";
import { SUPPORTED_HOSTS } from "@/lib/live-score/supported";
import { repoScoreCard } from "@/lib/og-card";
import { hostLabel } from "@/lib/utils/format";

// A cold card scores the repo, same as its page.
export const maxDuration = 60;

// Outside /score/ for the reason app/og/score/route.tsx gives. Previews are
// fetched by every chat app a link is pasted into, so the card keeps the
// page's hour: the same cache entry, and a CDN copy for as long.
const CACHE_CONTROL = "public, max-age=3600, s-maxage=3600";

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
  card.headers.set("Cache-Control", CACHE_CONTROL);
  return card;
}

import { notFound } from "next/navigation";

import { getCheckStats } from "@/lib/check-stats";
import { ogCard, ogSiteUrl } from "@/lib/og-card";
import { SIGNAL_BY_ID, SIGNALS } from "@/lib/scoring/signals";
import { checkPath, checkSlug, signalIdFromSlug } from "@/lib/utils/check-path";
import { percent } from "@/lib/utils/format";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SIGNALS.map((s) => ({ slug: checkSlug(s.id) }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const id = signalIdFromSlug((await params).slug);
  if (!id) {
    notFound();
  }

  const { full, total } = getCheckStats(id);

  return ogCard({
    heading: [SIGNAL_BY_ID[id].label],
    headingSize: 64,
    sub: `${full} of ${total} repos on the leaderboard pass it in full (${percent(full, total)}). What it checks, why agents need it, and how to pass.`,
    footerLeft: `One of the ${SIGNALS.length} checks behind every score`,
    footerRight: ogSiteUrl(checkPath(id)),
  });
}

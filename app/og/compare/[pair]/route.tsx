import { notFound } from "next/navigation";

import { pairSplit } from "@/lib/agent-scores";
import { getScoredRepos } from "@/lib/agent-scores-data";
import { compareAnswer, compareTitle } from "@/lib/compare-copy";
import { COMPARE_PAIRS, pairBySlug } from "@/lib/compare-pairs";
import { pageCard } from "@/lib/og-card";
import { comparePath } from "@/lib/utils/compare-path";

// Prerendered: rendering a card on request costs function CPU on every crawler fetch.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARE_PAIRS.map((p) => ({ pair: p.slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ pair: string }> }) {
  const pair = pairBySlug((await params).pair);
  if (!pair) notFound();
  // The answer's first sentence: both averages.
  const sub = compareAnswer(pair, pairSplit(getScoredRepos(), pair.a, pair.b)).split(". ")[0];

  return pageCard({ title: compareTitle(pair), sub: `${sub}.`, path: comparePath(pair.slug) });
}

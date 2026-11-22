import { notFound } from "next/navigation";

import { examplesTitle } from "@/lib/agents-md-examples";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { pageCard } from "@/lib/og-card";
import { checkSlug, checkSubPath } from "@/lib/utils/check-path";

const SIGNAL_ID = "agents_md";

// Prerendered: rendering a card on request costs function CPU on every crawler fetch.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: checkSlug(SIGNAL_ID) }];
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if ((await params).slug !== checkSlug(SIGNAL_ID)) notFound();
  const ex = getAgentsMdExamples();

  return pageCard({
    title: examplesTitle(ex.rows.length),
    sub: `${ex.passing} of them pass our check in full. Longest, shortest and most-starred, linked at their source.`,
    path: checkSubPath(SIGNAL_ID, "examples"),
  });
}

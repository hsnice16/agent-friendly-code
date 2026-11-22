import { notFound } from "next/navigation";

import { GUIDES, guideBySlug } from "@/lib/guides";
import { fillStats, getGuideStats } from "@/lib/guides/stats";
import { pageCard } from "@/lib/og-card";
import { guidePath } from "@/lib/utils/guide-path";

// Prerendered: rendering a card on request costs function CPU on every crawler fetch.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const stats = getGuideStats();

  return pageCard({ title: fillStats(g.title, stats), sub: fillStats(g.description, stats), path: guidePath(g.slug) });
}

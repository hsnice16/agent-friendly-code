import { notFound } from "next/navigation";

import { examplesCsv } from "@/lib/agents-md-examples";
import { BOARD_CACHE_CONTROL } from "@/lib/constants/cache";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { checkSlug } from "@/lib/utils/check-path";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: checkSlug("agents_md") }];
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if ((await params).slug !== checkSlug("agents_md")) notFound();

  return new Response(examplesCsv(getAgentsMdExamples().rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="agents-md-examples.csv"',
      "Cache-Control": BOARD_CACHE_CONTROL,
    },
  });
}

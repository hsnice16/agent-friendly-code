import { adoptionCsv } from "@/lib/agents-md-adoption";
import { ADOPTION } from "@/lib/agents-md-report";
import { BOARD_CACHE_CONTROL } from "@/lib/constants/cache";

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(adoptionCsv(ADOPTION.points), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="agents-md-adoption.csv"',
      "Cache-Control": BOARD_CACHE_CONTROL,
    },
  });
}

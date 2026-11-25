import { CONTENTS_DATA } from "@/lib/agents-md-contents-data";
import { contentsCsv } from "@/lib/agents-md-contents-report";
import { BOARD_CACHE_CONTROL } from "@/lib/constants/cache";

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(contentsCsv(CONTENTS_DATA.repos), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="agents-md-contents.csv"',
      "Cache-Control": BOARD_CACHE_CONTROL,
    },
  });
}

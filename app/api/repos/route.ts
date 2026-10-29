import { NextResponse } from "next/server";
import { BOARD_CACHE_CONTROL } from "@/lib/constants/cache";
import { listLeaderboardOverall } from "@/lib/db";

export const dynamic = "force-dynamic";

// `data/rank.db` ships inside the deployment, so this response cannot change
// until the next deploy. Uncached, every caller re-serialises the whole table.
const HEADERS = { "Cache-Control": BOARD_CACHE_CONTROL };

export async function GET() {
  return NextResponse.json(listLeaderboardOverall(), { headers: HEADERS });
}

import { NextResponse } from "next/server";
import { listLeaderboardOverall } from "@/lib/db";

export const dynamic = "force-dynamic";

// `data/rank.db` ships inside the deployment, so this response cannot change
// until the next deploy. Uncached, every caller re-serialises the whole table.
const HEADERS = { "Cache-Control": "public, max-age=3600, s-maxage=3600" };

export async function GET() {
  return NextResponse.json(listLeaderboardOverall(), { headers: HEADERS });
}

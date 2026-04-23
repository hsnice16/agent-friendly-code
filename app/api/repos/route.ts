import { NextResponse } from "next/server";
import { listLeaderboardOverall } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(listLeaderboardOverall());
}

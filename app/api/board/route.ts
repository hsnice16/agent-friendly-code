import { NextResponse } from "next/server";

import { buildBoardData } from "@/lib/board-data";

// Built once per deploy, like the boards it re-cuts: `data/rank.db` ships
// inside the deployment, so nothing here can change until the next one.
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(buildBoardData());
}

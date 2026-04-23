import { NextResponse } from "next/server";
import { getModelScores, getRepo, getSignalResults } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }

  const repo = getRepo(id);
  if (!repo) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({
    repo,
    signals: getSignalResults(id),
    modelScores: getModelScores(id),
  });
}

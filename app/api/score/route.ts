import { NextResponse } from "next/server";

import { isHost } from "@/lib/constants/hosts";
import { getModelScores, getRepoByHostOwnerName, getSignalResults } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const repoParam = url.searchParams.get("repo");
  const hostParam = url.searchParams.get("host") ?? "github";

  if (!isHost(hostParam)) {
    return NextResponse.json({ error: "unknown host" }, { status: 400 });
  }

  if (!repoParam) {
    return NextResponse.json({ error: "repo required" }, { status: 400 });
  }

  const parts = repoParam.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return NextResponse.json({ error: "repo must be owner/name" }, { status: 400 });
  }

  const [owner, name] = parts;
  const repo = getRepoByHostOwnerName(hostParam, owner, name);
  if (!repo) {
    return NextResponse.json({ error: "not_indexed" }, { status: 404 });
  }

  return NextResponse.json({
    repo,
    signals: getSignalResults(repo.id),
    modelScores: getModelScores(repo.id),
  });
}

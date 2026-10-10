import { NextResponse } from "next/server";

import { isHost } from "@/lib/constants/hosts";
import { getModelScores, getRepoByHostOwnerName, getSignalResults } from "@/lib/db";
import { ownerAndName } from "@/lib/utils/repo-path";

export const dynamic = "force-dynamic";

const HEADERS = { "Cache-Control": "public, max-age=3600, s-maxage=3600" };

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

  const parsed = ownerAndName(repoParam);
  if (!parsed) {
    return NextResponse.json({ error: "repo must be owner/name" }, { status: 400 });
  }

  const repo = getRepoByHostOwnerName(hostParam, parsed.owner, parsed.name);
  if (!repo) {
    return NextResponse.json({ error: "not_indexed" }, { status: 404 });
  }

  return NextResponse.json(
    {
      repo,
      signals: getSignalResults(repo.id),
      modelScores: getModelScores(repo.id),
    },
    { headers: HEADERS },
  );
}

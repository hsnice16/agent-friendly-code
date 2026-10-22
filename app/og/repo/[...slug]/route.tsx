import { notFound } from "next/navigation";

import { getRepoByHostOwnerName } from "@/lib/db";
import { repoScoreCard } from "@/lib/og-card";
import { hostLabel } from "@/lib/utils/format";
import { repoIdentity } from "@/lib/utils/repo-path";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const identity = repoIdentity((await params).slug);

  const repo = identity ? getRepoByHostOwnerName(identity.host, identity.owner, identity.name) : null;
  if (!repo) {
    notFound();
  }

  return repoScoreCard({
    slug: `${repo.owner}/${repo.name}`,
    score: repo.overall_score != null ? repo.overall_score.toFixed(1) : "—",
    context: [hostLabel(repo.host), repo.language],
  });
}

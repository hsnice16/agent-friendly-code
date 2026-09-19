import { notFound, permanentRedirect } from "next/navigation";

import { getRepo } from "@/lib/db";
import { repoPath } from "@/lib/utils/repo-path";

/**
 * Serves the pre-slug `/repo/:id` URLs, which `next.config.ts` rewrites here —
 * the id needs a database lookup, so a static redirect rule cannot resolve it.
 * Those ids are row ids: a reseed can repoint one at a different repo, which is
 * why the slug replaced them.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);

  const repo = Number.isInteger(id) && id > 0 ? getRepo(id) : null;
  if (!repo) {
    notFound();
  }

  permanentRedirect(repoPath(repo));
}

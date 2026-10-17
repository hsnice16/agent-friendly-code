import { getRepo } from "@/lib/db";
import { cachedRedirect, notFoundPage } from "@/lib/utils/cached-redirect";
import { repoPath } from "@/lib/utils/repo-path";

/** Serves the pre-slug `/repo/:id` URLs; `next.config.ts` says why they land here. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);

  const repo = Number.isInteger(id) && id > 0 ? getRepo(id) : null;
  return repo ? cachedRedirect(repoPath(repo), request) : notFoundPage();
}

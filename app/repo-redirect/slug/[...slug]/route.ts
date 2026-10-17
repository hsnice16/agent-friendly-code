import { getRepoByHostOwnerName } from "@/lib/db";
import { cachedRedirect, notFoundPage } from "@/lib/utils/cached-redirect";
import { redirectTarget, repoIdentity } from "@/lib/utils/repo-path";

/**
 * Every `/repo/...` path the prerendered repo page doesn't know lands here (see
 * `next.config.ts`). The lookup ignores case and follows former names, so a
 * repo answers to several spellings; all but the stored one redirect to it.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const identity = repoIdentity((await params).slug);
  const repo = identity ? getRepoByHostOwnerName(identity.host, identity.owner, identity.name) : null;
  const target = identity && repo ? redirectTarget(identity, repo) : null;
  return target ? cachedRedirect(target, request) : notFoundPage();
}

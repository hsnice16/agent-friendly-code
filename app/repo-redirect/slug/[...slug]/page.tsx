import { notFound, permanentRedirect } from "next/navigation";

import { getRepoByHostOwnerName } from "@/lib/db";
import { redirectTarget, repoIdentity, withQuery } from "@/lib/utils/repo-path";

/**
 * Every `/repo/...` path the prerendered repo page doesn't know lands here (see
 * `next.config.ts`). The lookup ignores case and follows former names, so a
 * repo answers to several spellings; all but the stored one redirect to it.
 */
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const identity = repoIdentity((await params).slug);
  const repo = identity ? getRepoByHostOwnerName(identity.host, identity.owner, identity.name) : null;
  const target = identity && repo ? redirectTarget(identity, repo) : null;
  if (!target) {
    notFound();
  }

  permanentRedirect(withQuery(target, await searchParams));
}

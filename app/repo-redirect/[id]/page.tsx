import { notFound, permanentRedirect } from "next/navigation";

import { getRepo } from "@/lib/db";
import { repoPath, withQuery } from "@/lib/utils/repo-path";

/** Serves the pre-slug `/repo/:id` URLs; `next.config.ts` says why they land here. */
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const id = Number((await params).id);

  const repo = Number.isInteger(id) && id > 0 ? getRepo(id) : null;
  if (!repo) {
    notFound();
  }

  permanentRedirect(withQuery(repoPath(repo), await searchParams));
}

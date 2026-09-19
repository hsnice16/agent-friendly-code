import { notFound, permanentRedirect } from "next/navigation";

import { getRepo } from "@/lib/db";
import { repoPath } from "@/lib/utils/repo-path";

// `?model=` rides on every repo link ModelSuggestions renders, so an old link
// that carried one has to arrive with it intact.
function withQuery(path: string, sp: Record<string, string | string[] | undefined>): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(sp)) {
    for (const v of Array.isArray(value) ? value : [value]) {
      if (v != null) query.append(key, v);
    }
  }

  const s = query.toString();
  return s ? `${path}?${s}` : path;
}

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

import { repoOwnership } from "@/lib/utils/own-repo";
import type { RepoIdentity } from "@/lib/utils/repo-path";

const LABEL = { site: "(this site's own repo)", author: "(by this site's author)" } as const;

export function OwnRepoTag({ repo }: { repo: RepoIdentity }) {
  const ownership = repoOwnership(repo);
  if (!ownership) {
    return null;
  }
  return <span className="ml-1.5 text-[12px] font-normal text-muted">{LABEL[ownership]}</span>;
}

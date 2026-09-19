import { isHost } from "@/lib/constants/hosts";

export type RepoIdentity = { host: string; owner: string; name: string };

// Host leads the path because `owner/name` is only unique within a host — the
// board carries GitHub, GitLab and Bitbucket repos side by side.
export function repoPath({ host, owner, name }: RepoIdentity): string {
  return `/repo/${[host, ...owner.split("/"), name].map(encodeURIComponent).join("/")}`;
}

// GitLab nests groups, so an owner can span several segments ("kicad/code").
// Host is always first and the repo name always last; everything between them
// is the owner. A fixed three-segment route would 404 on those repos.
export function repoIdentity(slug: string[] | undefined): RepoIdentity | null {
  if (!slug || slug.length < 3) return null;

  const [host, ...rest] = slug;
  const name = rest.pop();
  const owner = rest.join("/");

  return isHost(host) && owner && name ? { host, owner, name } : null;
}

import { isHost } from "@/lib/constants/hosts";

export type RepoIdentity = { host: string; owner: string; name: string };

// Host leads the path because `owner/name` is only unique within a host — the
// board carries GitHub, GitLab and Bitbucket repos side by side.
export function repoPath({ host, owner, name }: RepoIdentity): string {
  return `/repo/${[host, ...owner.split("/"), name].map(encodeURIComponent).join("/")}`;
}

export function liveScorePath({ host, owner, name }: RepoIdentity): string {
  return `/score/${[host, ...owner.split("/"), name].map(encodeURIComponent).join("/")}`;
}

// GitLab nests groups, so an owner can span several segments ("kicad/code").
// Host is always first and the repo name always last; everything between them
// is the owner. A fixed three-segment route would 404 on those repos.
export function repoIdentity(slug: string[] | undefined): RepoIdentity | null {
  if (!slug || slug.length < 3) return null;

  const [host, ...rest] = slug;
  const name = rest.pop();
  const owner = rest.join("/");

  // Validated case-insensitively to match the lookup, but returned as written
  // so the caller can spot a non-canonical spelling and redirect it.
  return isHost(host?.toLowerCase()) && owner && name ? { host, owner, name } : null;
}

// Old repo links carry `?model=`, which the repo page's agent switch reads, so
// a redirect has to pass the query on.
export function withQuery(path: string, sp: Record<string, string | string[] | undefined>): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(sp)) {
    for (const v of Array.isArray(value) ? value : [value]) {
      if (v != null) query.append(key, v);
    }
  }

  const s = query.toString();
  return s ? `${path}?${s}` : path;
}

// Same split as repoIdentity, for a bare `owner/name`.
export function ownerAndName(path: string): { owner: string; name: string } | null {
  const parts = path.split("/");
  const name = parts.pop();

  return name && parts.length > 0 && parts.every(Boolean) ? { owner: parts.join("/"), name } : null;
}

/**
 * Where a looked-up path should 308 to, or null when it already is the stored
 * path: a stored row the repo page didn't prerender would otherwise redirect
 * to itself.
 */
export function redirectTarget(identity: RepoIdentity, repo: RepoIdentity): string | null {
  const path = repoPath(repo);
  return path === repoPath(identity) ? null : path;
}

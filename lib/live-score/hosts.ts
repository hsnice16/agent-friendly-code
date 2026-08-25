// A tree API, not the tarball: `codeload` / GitLab `archive.tar.gz` run
// `git archive`, which honors `export-ignore` in `.gitattributes` — so an
// archive reflects a release while a tree reflects the repository. Measured
// impact and the rejected alternatives: tasks/0.7.0/01-tree-materializer.md.

import type { RepoHost } from "../clients/github";

export type EntryKind = "dir" | "file" | "symlink";

export type TreeEntry = {
  path: string;
  kind: EntryKind;
  /** Blob SHA, when the host exposes one. Used to recover a dangling symlink's target. */
  sha?: string;
};

const USER_AGENT = "agent-friendly-code";

const SYMLINK_MODE = "120000";

/** Deepest level any signal inspects is `size`'s MAX_DEPTH; 10 leaves headroom. */
const BITBUCKET_MAX_DEPTH = 10;

// Refuse rather than hang. Sits above the largest repo we score today
// (JetBrains/kotlin, ~97k entries); it exists for the pathological tail, and
// bites hardest on GitLab, which paginates at 100 entries per call.
export const MAX_ENTRIES = 150_000;

export class TooLargeError extends Error {
  constructor(host: RepoHost) {
    super(`Repository is too large to score on demand (${host})`);
    this.name = "TooLargeError";
  }
}

// Distinct from a generic failure so the page can say "come back shortly"
// instead of "check the URL" — unauthenticated GitHub allows 60 requests/hour
// per IP and serverless egress IPs are shared, so this is the failure a missing
// GITHUB_TOKEN actually produces.
export class RateLimitedError extends Error {
  constructor(host: RepoHost) {
    super(`Host API rate limit reached (${host})`);
    this.name = "RateLimitedError";
  }
}

// 429 is explicit; GitHub and GitLab both also answer a spent quota with 403.
function assertNotRateLimited(host: RepoHost, res: Response): void {
  if (res.status === 429 || res.status === 403) throw new RateLimitedError(host);
}

export function requestHeaders(host: RepoHost, token?: string): Record<string, string> {
  const base: Record<string, string> = { "User-Agent": USER_AGENT };
  if (!token) return base;
  if (host === "gitlab") base["PRIVATE-TOKEN"] = token;
  if (host === "github") base.Authorization = `Bearer ${token}`;
  return base;
}

function gitlabProjectId(owner: string, name: string): string {
  // Subgroups arrive in `owner` as a nested path, so the whole slug is encoded.
  return encodeURIComponent(`${owner}/${name}`);
}

async function paginate(
  host: RepoHost,
  first: string,
  init: RequestInit,
  nextUrl: (body: unknown, res: Response) => string | null,
): Promise<unknown[]> {
  const bodies: unknown[] = [];
  let url: string | null = first;
  let fetched = 0;

  while (url) {
    const res: Response = await fetch(url, init);
    if (!res.ok) {
      assertNotRateLimited(host, res);
      throw new Error(`${res.status} listing tree`);
    }
    const body: unknown = await res.json();
    bodies.push(body);

    fetched += Array.isArray(body) ? body.length : ((body as { values?: unknown[] }).values?.length ?? 0);
    if (fetched > MAX_ENTRIES) throw new TooLargeError(host);

    url = nextUrl(body, res);
  }

  return bodies;
}

type GitHubNode = { path: string; type: string; mode: string; sha: string };

async function listGitHub(owner: string, name: string, ref: string, token?: string): Promise<TreeEntry[]> {
  const init = { headers: requestHeaders("github", token) };
  const api = `https://api.github.com/repos/${owner}/${name}/git/trees`;

  const res = await fetch(`${api}/${ref}?recursive=1`, init);
  if (!res.ok) {
    assertNotRateLimited("github", res);
    throw new Error(`${res.status} listing tree`);
  }
  let { tree, truncated } = (await res.json()) as { tree: GitHubNode[]; truncated: boolean };

  // `?recursive=1` truncates mid-walk in *sorted* order, so a huge repo loses
  // whatever sorts last — for JetBrains/kotlin that was gradlew, LICENSE,
  // CONTRIBUTING.md and tests/, worth 26.8 points. Re-walk one subtree at a
  // time; each comes back whole. A subtree big enough to truncate on its own
  // would still lose entries; none of the fixtures reach that, so it is not
  // recursed further.
  if (truncated) {
    const rootRes = await fetch(`${api}/${ref}`, init);
    if (rootRes.ok) {
      const root = (await rootRes.json()) as { tree: GitHubNode[] };
      const merged = new Map<string, GitHubNode>(root.tree.map((e) => [e.path, e]));

      await Promise.all(
        root.tree
          .filter((e) => e.type === "tree")
          .map(async (dir) => {
            const sub = await fetch(`${api}/${dir.sha}?recursive=1`, init);
            if (!sub.ok) return;
            for (const e of ((await sub.json()) as { tree: GitHubNode[] }).tree) {
              const path = `${dir.path}/${e.path}`;
              merged.set(path, { ...e, path });
            }
          }),
      );

      tree = [...merged.values()];
    }
  }

  if (tree.length > MAX_ENTRIES) throw new TooLargeError("github");

  return tree.map((e) => ({
    path: e.path,
    sha: e.sha,
    // Submodules arrive as type "commit"; a --depth 1 clone leaves them as empty
    // directories, so counting them as files inflates `size`.
    kind: e.type === "tree" || e.type === "commit" ? "dir" : e.mode === SYMLINK_MODE ? "symlink" : "file",
  }));
}

type GitLabNode = { path: string; type: string; mode: string; id: string };

async function listGitLab(owner: string, name: string, ref: string, token?: string): Promise<TreeEntry[]> {
  const base = `https://gitlab.com/api/v4/projects/${gitlabProjectId(owner, name)}/repository/tree?recursive=true&per_page=100&ref=${ref}`;

  const bodies = await paginate("gitlab", base, { headers: requestHeaders("gitlab", token) }, (_body, res) => {
    const page = res.headers.get("x-next-page");
    return page ? `${base}&page=${page}` : null;
  });

  return (bodies as GitLabNode[][]).flat().map((e) => ({
    path: e.path,
    sha: e.id,
    kind: e.type === "tree" || e.type === "commit" ? "dir" : e.mode === SYMLINK_MODE ? "symlink" : "file",
  }));
}

type BitbucketNode = { path: string; type: string; attributes?: string[] };

async function listBitbucket(owner: string, name: string, ref: string): Promise<TreeEntry[]> {
  const base = `https://api.bitbucket.org/2.0/repositories/${owner}/${name}/src/${ref}/?max_depth=${BITBUCKET_MAX_DEPTH}&pagelen=100`;

  const bodies = await paginate("bitbucket", base, { headers: requestHeaders("bitbucket") }, (body) => {
    return (body as { next?: string }).next ?? null;
  });

  return (bodies as { values: BitbucketNode[] }[])
    .flatMap((b) => b.values)
    .map((v) => {
      const attributes = v.attributes ?? [];
      const kind: EntryKind =
        v.type === "commit_directory" || attributes.includes("subrepository")
          ? "dir"
          : attributes.includes("link")
            ? "symlink"
            : "file";
      return { path: v.path, kind };
    });
}

export function listTree(
  host: RepoHost,
  owner: string,
  name: string,
  ref: string,
  token?: string,
): Promise<TreeEntry[]> {
  if (host === "gitlab") return listGitLab(owner, name, ref, token);
  if (host === "bitbucket") return listBitbucket(owner, name, ref);
  return listGitHub(owner, name, ref, token);
}

export function rawUrl(host: RepoHost, owner: string, name: string, ref: string, path: string): string {
  if (host === "gitlab") {
    return `https://gitlab.com/api/v4/projects/${gitlabProjectId(owner, name)}/repository/files/${encodeURIComponent(path)}/raw?ref=${ref}`;
  }
  if (host === "bitbucket") {
    return `https://api.bitbucket.org/2.0/repositories/${owner}/${name}/src/${ref}/${path}`;
  }
  return `https://raw.githubusercontent.com/${owner}/${name}/${ref}/${path}`;
}

// A dangling symlink 404s on the raw endpoint because the target doesn't
// resolve, but the blob still holds the stored target path.
export function blobUrl(host: RepoHost, owner: string, name: string, sha: string): string | null {
  if (host === "github") return `https://api.github.com/repos/${owner}/${name}/git/blobs/${sha}`;
  if (host === "gitlab") {
    return `https://gitlab.com/api/v4/projects/${gitlabProjectId(owner, name)}/repository/blobs/${sha}/raw`;
  }
  return null;
}

/**
 * Resolve a ref to its commit SHA. Pins the score to one commit — otherwise a
 * push between the tree listing and the content fetches would mix two revisions
 * into one result — and gives the page an honest freshness marker.
 */
export async function resolveCommit(
  host: RepoHost,
  owner: string,
  name: string,
  ref: string,
  token?: string,
): Promise<string | null> {
  const init = { headers: requestHeaders(host, token) };

  if (host === "github") {
    const res = await fetch(`https://api.github.com/repos/${owner}/${name}/commits/${ref}`, init);
    if (!res.ok) {
      assertNotRateLimited(host, res);
      return null;
    }
    return ((await res.json()) as { sha?: string }).sha ?? null;
  }

  if (host === "gitlab") {
    const res = await fetch(
      `https://gitlab.com/api/v4/projects/${gitlabProjectId(owner, name)}/repository/commits/${ref}`,
      init,
    );
    if (!res.ok) {
      assertNotRateLimited(host, res);
      return null;
    }
    return ((await res.json()) as { id?: string }).id ?? null;
  }

  const res = await fetch(`https://api.bitbucket.org/2.0/repositories/${owner}/${name}/commit/${ref}`, init);
  if (!res.ok) {
    assertNotRateLimited(host, res);
    return null;
  }
  return ((await res.json()) as { hash?: string }).hash ?? null;
}

export function hostToken(host: RepoHost): string | undefined {
  if (host === "gitlab") return process.env.GITLAB_TOKEN;
  if (host === "github") return process.env.GITHUB_TOKEN;
  return undefined;
}

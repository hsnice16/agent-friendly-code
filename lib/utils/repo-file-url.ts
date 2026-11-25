import type { SignalResult } from "@/lib/scoring/signals";

type RepoLocation = { url: string; host: string; default_branch: string | null };

// Signals don't record whether a match is a directory; these are the ones
// that can match one, and the hosts route trees and blobs differently.
export function matchesDirectory(signal: Pick<SignalResult, "id" | "pass" | "matchedPath">): boolean {
  return (
    (signal.id === "tests" && signal.pass >= 1) ||
    (signal.id === "ci" && signal.matchedPath === ".github/workflows") ||
    (signal.id === "pre_commit" && signal.matchedPath === ".husky")
  );
}

const segments = (s: string) => s.split("/").map(encodeURIComponent).join("/");

/** The file on the repo's default branch, or null without one: a guessed branch can 404. */
export function repoFileUrl(repo: RepoLocation, path: string, directory = false): string | null {
  if (!repo.default_branch) return null;

  const ref = `${segments(repo.default_branch)}/${segments(path)}`;
  const base = repo.url.replace(/\/+$/, "");
  if (repo.host === "gitlab") return `${base}/-/${directory ? "tree" : "blob"}/${ref}`;
  if (repo.host === "bitbucket") return `${base}/src/${ref}`;
  return `${base}/${directory ? "tree" : "blob"}/${ref}`;
}

/** The file's raw bytes, for a `curl` that copies it; null without a default branch. */
export function repoRawFileUrl(repo: RepoLocation, path: string): string | null {
  if (!repo.default_branch) return null;

  const ref = `${segments(repo.default_branch)}/${segments(path)}`;
  const base = repo.url.replace(/\/+$/, "");
  if (repo.host === "gitlab") return `${base}/-/raw/${ref}`;
  if (repo.host === "bitbucket") return `${base}/raw/${ref}`;
  const gh = base.match(/^https:\/\/github\.com\/(.+)$/);
  return gh ? `https://raw.githubusercontent.com/${gh[1]}/${ref}` : null;
}

/** The file as it was at one commit, optionally at a line: a quote must keep pointing at what it quoted. */
export function repoFileAtCommitUrl(
  repo: { url: string; host: string },
  sha: string,
  path: string,
  line?: number,
): string {
  const base = repo.url.replace(/\/+$/, "");
  const ref = `${encodeURIComponent(sha)}/${segments(path)}`;
  const anchor = line ? `#L${line}` : "";
  if (repo.host === "gitlab") return `${base}/-/blob/${ref}${anchor}`;
  if (repo.host === "bitbucket") return `${base}/src/${ref}${line ? `#lines-${line}` : ""}`;
  // GitHub renders Markdown and drops the line anchor unless shown as plain text.
  return `${base}/blob/${ref}${line ? `?plain=1${anchor}` : ""}`;
}

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

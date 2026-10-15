import { HOST_DOMAINS, HOSTS } from "@/lib/constants/hosts";
import { REPO_URL } from "@/lib/version";

import type { RepoIdentity } from "./repo-path";

const url = new URL(REPO_URL);
const [owner = "", name = ""] = url.pathname.split("/").filter(Boolean);

export const OWN_REPO: RepoIdentity = { host: HOSTS.find((h) => HOST_DOMAINS[h] === url.hostname) ?? "", owner, name };

type RepoOwnership = "site" | "author";

// Labelled on the board, not excluded: they are scored by the same rules as
// every other repo, but a reader should know the site is ranking its author's
// own code.
export function repoOwnership(r: RepoIdentity): RepoOwnership | null {
  if (r.host !== OWN_REPO.host || r.owner.toLowerCase() !== OWN_REPO.owner.toLowerCase()) {
    return null;
  }
  return r.name.toLowerCase() === OWN_REPO.name.toLowerCase() ? "site" : "author";
}

import { firstExisting, readSafe } from "./scoring/signals/helpers";

const README_CANDIDATES = ["README.md", "README.rst", "README.txt", "README"];

export function detectBadgeEmbed(repoPath: string, slug: string): boolean {
  const p = firstExisting(repoPath, README_CANDIDATES);
  if (!p) {
    return false;
  }

  // Case-insensitive like the badge route's lookup. Bounded at the end, so the
  // badge of repo "hono-extra" isn't read as one for "hono".
  return badgePattern(slug).test(readSafe(p, repoPath));
}

function badgePattern(slug: string): RegExp {
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`/api/badge/${escaped}(?:\\.svg)?(?![\\w.-])`, "i");
}

export type CodeSearchHit = { repo: string; fork: boolean; path: string; fragments: string[] };

/**
 * Repos whose README (root or .github/, where GitHub also looks) shows their own badge. Code search also returns
 * copies of an adopter's README (vendored node_modules, datasets, forks under
 * another name), which would count axios dozens of times.
 */
export function selfBadgeRepos(hits: CodeSearchHit[]): string[] {
  const adopters = new Map<string, string>();
  for (const hit of hits) {
    if (hit.fork || !/^(\.github\/)?readme(\.\w+)?$/i.test(hit.path)) continue;
    const own = badgePattern(`github/${hit.repo}`);
    const key = hit.repo.toLowerCase();
    if (!adopters.has(key) && hit.fragments.some((f) => own.test(f))) adopters.set(key, hit.repo);
  }
  return [...adopters.values()].sort((a, b) => a.localeCompare(b));
}

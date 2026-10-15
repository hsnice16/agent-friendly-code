import { firstExisting, readSafe } from "./scoring/signals/helpers";

const README_CANDIDATES = ["README.md", "README.rst", "README.txt", "README"];

export function detectBadgeEmbed(repoPath: string, slug: string): boolean {
  const p = firstExisting(repoPath, README_CANDIDATES);
  if (!p) {
    return false;
  }

  // Case-insensitive like the badge route's lookup. Bounded at the end, so the
  // badge of repo "hono-extra" isn't read as one for "hono".
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`/api/badge/${escaped}(?:\\.svg)?(?![\\w.-])`, "i").test(readSafe(p, repoPath));
}

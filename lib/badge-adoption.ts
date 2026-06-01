import { firstExisting, readSafe } from "./scoring/signals/helpers";

const README_CANDIDATES = ["README.md", "README.rst", "README.txt", "README"];

export function detectBadgeEmbed(repoPath: string, slug: string): boolean {
  const p = firstExisting(repoPath, README_CANDIDATES);
  if (!p) {
    return false;
  }

  return readSafe(p).includes(`/api/badge/${slug}`);
}

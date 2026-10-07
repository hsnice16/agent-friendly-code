import { LANGUAGE_HUB_MIN_REPOS } from "@/lib/constants/scoring";

export type LanguageGroup<T> = { slug: string; label: string; rows: T[] };

const SLUG_OVERRIDES: Record<string, string> = { "c++": "cpp", "c#": "csharp", "f#": "fsharp" };

export function languageSlug(language: string): string {
  const lower = language.trim().toLowerCase();
  return SLUG_OVERRIDES[lower] ?? lower.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Hosts disagree on casing ("Java", "java"), so one language arrives as two
// values. Group by slug; label with the most common spelling.
export function groupByLanguage<T extends { language: string | null }>(rows: T[]): LanguageGroup<T>[] {
  const groups = new Map<string, { rows: T[]; spellings: Map<string, number> }>();

  for (const row of rows) {
    if (!row.language) continue;
    const slug = languageSlug(row.language);
    if (!slug) continue;
    const g = groups.get(slug) ?? { rows: [] as T[], spellings: new Map<string, number>() };
    g.rows.push(row);
    g.spellings.set(row.language, (g.spellings.get(row.language) ?? 0) + 1);
    groups.set(slug, g);
  }

  return [...groups.entries()]
    .map(([slug, g]) => ({
      slug,
      rows: g.rows,
      label: [...g.spellings.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0],
    }))
    .sort((a, b) => b.rows.length - a.rows.length || a.label.localeCompare(b.label));
}

export function isHub(group: { rows: unknown[] }): boolean {
  return group.rows.length >= LANGUAGE_HUB_MIN_REPOS;
}

export function averageScore(rows: { score: number | null }[]): number {
  return rows.reduce((sum, r) => sum + (r.score ?? 0), 0) / rows.length;
}

export function hubPath(slug: string): string {
  return `/language/${slug}`;
}

// Peers around this score, not the top of the language: picking the top made
// every page link the same few repos and left the rest with no inbound links.
// `peers` must be sorted by score, highest first.
export function nearestByScore<T extends { score: number | null }>(peers: T[], score: number, limit: number): T[] {
  if (peers.length <= limit) return peers;
  const below = peers.findIndex((p) => (p.score ?? 0) < score);
  const pivot = below === -1 ? peers.length : below;
  const start = Math.min(Math.max(0, pivot - Math.floor(limit / 2)), peers.length - limit);
  return peers.slice(start, start + limit);
}

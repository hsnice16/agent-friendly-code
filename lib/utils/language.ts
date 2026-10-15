import { LANGUAGE_HUB_MIN_REPOS } from "@/lib/constants/scoring";
import { MAX_TITLE_LENGTH } from "@/lib/utils/page-title";

export type LanguageGroup<T> = { slug: string; label: string; rows: T[] };

const SLUG_OVERRIDES: Record<string, string> = { "c++": "cpp", "c#": "csharp", "f#": "fsharp" };

export function languageSlug(language: string): string {
  const lower = language.trim().toLowerCase();
  return SLUG_OVERRIDES[lower] ?? lower.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Rows scored before canonicalLanguage keep the host's casing ("Java", "java").
// Group by slug; label with the most common spelling.
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
  if (rows.length === 0) return 0;
  return rows.reduce((sum, r) => sum + (r.score ?? 0), 0) / rows.length;
}

export function hubPath(slug: string): string {
  return `/language/${slug}`;
}

export const OTHER_LANGUAGES_PATH = "/language/other";
export const UNKNOWN_LANGUAGE = { slug: "unknown", label: "Language not detected" } as const;

/** Languages too small for a hub, then the repos with no language, so every repo is on some hub page. */
export function otherLanguageGroups<T extends { language: string | null }>(rows: T[]): LanguageGroup<T>[] {
  const small = groupByLanguage(rows).filter((g) => !isHub(g));
  const unknown = rows.filter((r) => !r.language || !languageSlug(r.language));
  return unknown.length > 0 ? [...small, { ...UNKNOWN_LANGUAGE, rows: unknown }] : small;
}

/** Falls back to shorter wordings, then a cut label, so a long language name cannot push a title past the limit. */
export function hubTitle(label: string, max = MAX_TITLE_LENGTH): string {
  const options = [`Most agent-friendly ${label} repos`, `Agent-friendly ${label} repos`, `${label} repos`];
  const fit = options.find((t) => t.length <= max);
  return fit ?? `${label.slice(0, max - " repos".length - 1).trimEnd()}… repos`;
}

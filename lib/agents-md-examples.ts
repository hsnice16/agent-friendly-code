import type { LeaderboardRow, SignalFile } from "./types/db";
import { fileLength, hasAgentFile } from "./utils/agent-instructions";
import { groupByLanguage, isHub, languageSlug } from "./utils/language";
import { repoOwnership } from "./utils/own-repo";
import { fitDescription } from "./utils/page-title";
import { repoFileUrl } from "./utils/repo-file-url";

export type ExampleRow = LeaderboardRow & {
  file: string;
  length: number | null;
  pass: number;
  fileUrl: string | null;
};

export type AgentsMdExamples = {
  /** Every repo on the board with a non-empty instructions file, most-starred first. */
  rows: ExampleRow[];
  boardSize: number;
  passing: number;
  longest: ExampleRow[];
  shortest: ExampleRow[];
  byFile: { file: string; count: number; passing: number }[];
  /** Most-starred repos with no file, or only an empty one. */
  missing: LeaderboardRow[];
  languages: { slug: string; label: string; withFile: number; total: number }[];
  /** Characters in the middle file of those with a measured length; null when none has one. */
  medianLength: number | null;
};

export const LENGTH_LIST_LIMIT = 5;
/** Fewer files than this make a thin page that adds nothing to the full list. */
export const LANGUAGE_EXAMPLES_MIN = 5;

export type LanguageExamples = { slug: string; label: string; rows: ExampleRow[]; total: number; passing: number };

// People search "golang agents.md"; the board labels the language "Go".
const SEARCH_NAMES: Record<string, string> = { go: "Go (Golang)" };
const MISSING_LIST_LIMIT = 8;

const byStars = (a: LeaderboardRow, b: LeaderboardRow) => (b.stars ?? 0) - (a.stars ?? 0);

export function buildAgentsMdExamples(board: LeaderboardRow[], files: SignalFile[]): AgentsMdExamples {
  const fileOf = new Map(files.map((f) => [f.repoId, f]));
  const rows: ExampleRow[] = [];

  for (const r of board) {
    const f = fileOf.get(r.id);
    if (!f?.matchedPath || !hasAgentFile(f)) continue;
    rows.push({
      ...r,
      file: f.matchedPath,
      length: fileLength(f.detail),
      pass: f.pass,
      fileUrl: repoFileUrl(r, f.matchedPath),
    });
  }
  rows.sort(byStars);

  // The author's own repos are labelled on the board, but these lists read as
  // examples to copy, and the author's files would top them on length alone.
  const passing = rows.filter((r) => r.pass >= 1 && r.length != null && !repoOwnership(r));
  const byLength = [...passing].sort((a, b) => (b.length ?? 0) - (a.length ?? 0));

  const byFile = new Map<string, { count: number; passing: number }>();
  for (const r of rows) {
    const c = byFile.get(r.file) ?? { count: 0, passing: 0 };
    c.count++;
    if (r.pass >= 1) c.passing++;
    byFile.set(r.file, c);
  }

  const has = new Set(rows.map((r) => r.id));
  const languages = groupByLanguage(board)
    .filter(isHub)
    .map((g) => ({
      slug: g.slug,
      label: g.label,
      total: g.rows.length,
      withFile: g.rows.filter((r) => has.has(r.id)).length,
    }))
    .sort((a, b) => b.withFile / b.total - a.withFile / a.total || b.total - a.total);

  return {
    rows,
    boardSize: board.length,
    passing: rows.filter((r) => r.pass >= 1).length,
    longest: byLength.slice(0, LENGTH_LIST_LIMIT),
    // From the remainder, so a short list never repeats a repo already under longest.
    shortest: byLength.slice(LENGTH_LIST_LIMIT).slice(-LENGTH_LIST_LIMIT).reverse(),
    byFile: [...byFile.entries()].map(([file, c]) => ({ file, ...c })).sort((a, b) => b.count - a.count),
    missing: board
      .filter((r) => fileOf.has(r.id) && !has.has(r.id))
      .sort(byStars)
      .slice(0, MISSING_LIST_LIMIT),
    languages,
    medianLength: median(rows.flatMap((r) => (r.length == null ? [] : [r.length]))),
  };
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function examplesTitle(count: number): string {
  return `AGENTS.md examples: ${count} real files from open source repos`;
}

export function examplesDescription(ex: Pick<AgentsMdExamples, "rows" | "passing">): string {
  return fitDescription(
    `Real AGENTS.md and CLAUDE.md files from ${ex.rows.length} open source repos, linked at their source.`,
    `${ex.passing} pass our check in full.`,
    "The most-starred, the longest and shortest, and which file name repos use.",
  );
}

/** Hub languages with enough files for a page of their own, most files first. */
export function examplesByLanguage(ex: Pick<AgentsMdExamples, "rows" | "languages">): LanguageExamples[] {
  return ex.languages
    .filter((l) => l.withFile >= LANGUAGE_EXAMPLES_MIN)
    .map((l) => {
      const rows = ex.rows.filter((r) => r.language != null && languageSlug(r.language) === l.slug);
      return { slug: l.slug, label: l.label, rows, total: l.total, passing: rows.filter((r) => r.pass >= 1).length };
    })
    .sort((a, b) => b.rows.length - a.rows.length);
}

export function languageExamplesTitle(lang: Pick<LanguageExamples, "label" | "rows">): string {
  return `${lang.label} AGENTS.md examples: ${lang.rows.length} open source repos`;
}

export function languageExamplesDescription(lang: LanguageExamples): string {
  const name = SEARCH_NAMES[lang.slug] ?? lang.label;
  return fitDescription(
    `Real AGENTS.md and CLAUDE.md files from ${lang.rows.length} ${name} repos, linked at their source.`,
    `${lang.passing} pass our check in full.`,
    "With each file's length, the repo's stars and its agent-readiness score.",
  );
}

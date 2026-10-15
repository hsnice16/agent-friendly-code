import type { LeaderboardRow, SignalFile } from "./types/db";
import { fileLength, hasAgentFile } from "./utils/agent-instructions";
import { groupByLanguage, isHub } from "./utils/language";
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
};

export const LENGTH_LIST_LIMIT = 5;
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
    shortest: byLength.slice(-LENGTH_LIST_LIMIT).reverse(),
    byFile: [...byFile.entries()].map(([file, c]) => ({ file, ...c })).sort((a, b) => b.count - a.count),
    missing: board
      .filter((r) => fileOf.has(r.id) && !has.has(r.id))
      .sort(byStars)
      .slice(0, MISSING_LIST_LIMIT),
    languages,
  };
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

import type { AdoptionPoint } from "../agents-md-adoption";
import { ADOPTION } from "../agents-md-report";
import { CENSUS_SUMMARY } from "../file-census";
import type { Guide } from "./types";

// The board-derived {{stat}} keys (stats.ts), and the adoption series fields that
// move with each. Every other key but `agents` comes from the file census.
const BOARD_STATS: Record<string, (keyof AdoptionPoint)[]> = {
  boardSize: ["repos"],
  withFile: ["withFile"],
  medianChars: ["medianChars"],
  skillsRepos: ["agentSkills"],
  skillsPct: ["agentSkills", "repos"],
};
const CODE_STATS = new Set(["agents"]);

/** The last snapshot day on which any of `fields` differed from the day before. */
export function seriesChangedOn(points: AdoptionPoint[], fields: (keyof AdoptionPoint)[]): string | null {
  for (let i = points.length - 1; i > 0; i--) {
    if (fields.some((f) => points[i][f] !== points[i - 1][f])) return points[i].date;
  }
  return points[0]?.date ?? null;
}

const TOKEN = /\{\{(\w+)\}\}/g;

/**
 * A guide's YYYY-MM-DD dateModified: its last prose edit, or a later move in a
 * number it shows. Not the board's last rescore, which moves almost daily while
 * a guide's text and figures stay put.
 */
export function guideModified(
  g: Guide,
  points: AdoptionPoint[] = ADOPTION.points,
  censusDate: string = CENSUS_SUMMARY.date,
): string {
  const fields = new Set<keyof AdoptionPoint>();
  let census = false;
  for (const [, key] of JSON.stringify(g).matchAll(TOKEN)) {
    if (Object.hasOwn(BOARD_STATS, key)) for (const f of BOARD_STATS[key]) fields.add(f);
    else if (!CODE_STATS.has(key)) census = true;
  }
  if (g.sections.some((s) => s.blocks.some((b) => b.kind === "examples"))) fields.add("withFile");

  const dates = [g.updated];
  if (census) dates.push(censusDate);
  const moved = fields.size > 0 ? seriesChangedOn(points, [...fields]) : null;
  if (moved) dates.push(moved);
  return dates.sort().at(-1) ?? g.updated;
}

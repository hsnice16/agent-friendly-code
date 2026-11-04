import { fileLength, HAS_FILE_PASS, hasAgentFile, OTHER_FILES } from "./utils/agent-instructions";
import { median } from "./utils/median";

/** One leaderboard repo's row for one check, from one snapshot of the database. */
export type SnapshotRow = {
  url: string;
  signalId: string | null;
  pass: number | null;
  detail: string | null;
  matchedPath: string | null;
};

export type OtherFileKey = (typeof OTHER_FILES)[number]["key"];

export type AdoptionPoint = {
  /** UTC day, YYYY-MM-DD. */
  date: string;
  repos: number;
  /** AGENTS.md, CLAUDE.md or another name the agents_md check accepts, with content. */
  withFile: number;
  /** Root AGENTS.md with content. */
  agentsMd: number;
  /** Root CLAUDE.md with content and no AGENTS.md with content: the check stops at the first. */
  claudeMd: number;
  medianChars: number | null;
} & Record<OtherFileKey, number | null>;

/** The repos on the board in the first point and still on it in the last, so the change isn't the sample's. */
export type AdoptionCohort = {
  since: string;
  repos: number;
  withFileThen: number;
  withFileNow: number;
  agentsMdThen: number;
  agentsMdNow: number;
};

export type AdoptionSeries = { minRepos: number; points: AdoptionPoint[]; cohort: AdoptionCohort | null };

/** What the chart, table, report and its JSON-LD call each series; the CSV keeps its own column keys. */
export const SERIES_LABEL = {
  agentsMd: "AGENTS.md",
  claudeMd: "CLAUDE.md, no AGENTS.md",
  withFile: "Any instructions file",
} as const;

/** The first day of seeding scored a handful of repos; a share of them says nothing. */
export const MIN_REPOS = 100;

type RepoFlags = { withFile: boolean; agentsMd: boolean };

const hasMainFile = (r: SnapshotRow) =>
  r.signalId === "agents_md" && r.pass != null && hasAgentFile({ pass: r.pass, matchedPath: r.matchedPath });

/** What each repo on the board has, keyed by lowercased URL: hosts treat names case-insensitively. */
export function repoFlags(rows: SnapshotRow[]): Map<string, RepoFlags> {
  const out = new Map<string, RepoFlags>();
  for (const r of rows) {
    const key = r.url.toLowerCase();
    const flags = out.get(key) ?? { withFile: false, agentsMd: false };
    if (hasMainFile(r)) {
      flags.withFile = true;
      flags.agentsMd = r.matchedPath?.toLowerCase() === "agents.md";
    }
    out.set(key, flags);
  }
  return out;
}

export function snapshotPoint(date: string, rows: SnapshotRow[]): AdoptionPoint {
  const repos = new Set(rows.map((r) => r.url.toLowerCase())).size;
  const main = rows.filter(hasMainFile);
  const named = (name: string) => main.filter((r) => r.matchedPath?.toLowerCase() === name).length;

  const point: AdoptionPoint = {
    date,
    repos,
    withFile: main.length,
    agentsMd: named("agents.md"),
    claudeMd: named("claude.md"),
    medianChars: median(main.flatMap((r) => fileLength(r.detail) ?? [])),
    geminiMd: null,
    cursorRules: null,
    agentSkills: null,
    openhandsSetup: null,
    aiderConf: null,
  };
  for (const f of OTHER_FILES) {
    const own = rows.filter((r) => r.signalId === f.signalId);
    // A check added later has no rows in older snapshots: unknown, not zero.
    point[f.key] = own.length === 0 ? null : own.filter((r) => (r.pass ?? 0) >= HAS_FILE_PASS).length;
  }
  return point;
}

export function buildCohort(since: string, first: Map<string, RepoFlags>, last: Map<string, RepoFlags>) {
  const cohort: AdoptionCohort = {
    since,
    repos: 0,
    withFileThen: 0,
    withFileNow: 0,
    agentsMdThen: 0,
    agentsMdNow: 0,
  };
  for (const [url, then] of first) {
    const now = last.get(url);
    if (!now) continue;
    cohort.repos++;
    cohort.withFileThen += Number(then.withFile);
    cohort.withFileNow += Number(now.withFile);
    cohort.agentsMdThen += Number(then.agentsMd);
    cohort.agentsMdNow += Number(now.agentsMd);
  }
  return cohort;
}

/** Of a list of snapshots, oldest first, the last one of each UTC day. */
export function lastPerDay<T extends { at: Date }>(snapshots: T[]): (T & { date: string })[] {
  const byDay = new Map<string, T>();
  for (const s of snapshots) byDay.set(s.at.toISOString().slice(0, 10), s);
  return [...byDay].map(([date, s]) => ({ ...s, date }));
}

/** The first point of each UTC month, and the latest: the series at a size a page can carry. */
export function monthlyPoints(points: AdoptionPoint[]): AdoptionPoint[] {
  const out = points.filter((p, i) => i === 0 || p.date.slice(0, 7) !== points[i - 1].date.slice(0, 7));
  const last = points.at(-1);
  return last && out.at(-1) !== last ? [...out, last] : out;
}

const CSV_COLUMNS: [string, (p: AdoptionPoint) => number | string | null][] = [
  ["date", (p) => p.date],
  ["repos", (p) => p.repos],
  ["with_instructions_file", (p) => p.withFile],
  ["agents_md", (p) => p.agentsMd],
  ["claude_md_only", (p) => p.claudeMd],
  ...OTHER_FILES.map((f): [string, (p: AdoptionPoint) => number | null] => [f.signalId, (p) => p[f.key]]),
  ["median_chars", (p) => p.medianChars],
];

/** Counts, not shares, so a reader can rebase them; an empty cell is a check that didn't exist yet. */
export function adoptionCsv(points: AdoptionPoint[]): string {
  const lines = [CSV_COLUMNS.map(([name]) => name).join(",")];
  for (const p of points) lines.push(CSV_COLUMNS.map(([, get]) => get(p) ?? "").join(","));
  return `${lines.join("\n")}\n`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isCount = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0;
const isCountOrNull = (v: unknown): v is number | null => v === null || isCount(v);
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function fail(): never {
  throw new Error("agents-md-adoption.json: unexpected shape");
}

function counts<K extends string>(o: Record<string, unknown>, keys: readonly K[]): Record<K, number> {
  return Object.fromEntries(keys.map((k) => [k, isCount(o[k]) ? o[k] : fail()])) as Record<K, number>;
}

function countsOrNull<K extends string>(o: Record<string, unknown>, keys: readonly K[]): Record<K, number | null> {
  return Object.fromEntries(keys.map((k) => [k, isCountOrNull(o[k]) ? o[k] : fail()])) as Record<K, number | null>;
}

const object = (v: unknown): Record<string, unknown> => (isObject(v) ? v : fail());
const day = (v: unknown): string => (typeof v === "string" && DATE_RE.test(v) ? v : fail());

// The file is written by the rescore job, which runs untrusted repos' parsers:
// only known keys holding dates and counts are copied out, so nothing else can
// reach a page.
export function parseAdoption(raw: unknown): AdoptionSeries {
  const s = object(raw);
  if (!Array.isArray(s.points) || s.points.length === 0) fail();
  const points: AdoptionPoint[] = s.points.map((v: unknown) => {
    const p = object(v);
    return {
      date: day(p.date),
      ...counts(p, ["repos", "withFile", "agentsMd", "claudeMd"]),
      ...countsOrNull(p, ["medianChars", ...OTHER_FILES.map((f) => f.key)]),
    };
  });
  // String order is date order for YYYY-MM-DD; strictly ascending also rules out a repeated day.
  if (points.some((p, i) => i > 0 && p.date <= points[i - 1].date)) fail();

  let cohort: AdoptionCohort | null = null;
  if (s.cohort !== null) {
    const c = object(s.cohort);
    cohort = {
      since: day(c.since),
      ...counts(c, ["repos", "withFileThen", "withFileNow", "agentsMdThen", "agentsMdNow"]),
    };
  }
  return { minRepos: counts(s, ["minRepos"]).minRepos, points, cohort };
}

import type { ExampleRow } from "./agents-md-examples";
import { SIZE_GROUP_MIN, SIZE_LANGUAGE_LIMIT } from "./constants/scoring";
import type { LeaderboardRow } from "./types/db";
import { languageSlug } from "./utils/language";
import { median } from "./utils/median";
import { fitDescription } from "./utils/page-title";

// The agents' caps are in bytes; the check counts characters. The two agree
// for ASCII text, which is most of what these files hold.
export const DEVIN_CAP = 16 * 1024;
export const CODEX_CAP = 32 * 1024;

const K = 1024;
/** Edges in KiB-sized steps, so the last two line up with Devin's and Codex's caps. */
const SIZE_BUCKETS = [
  { label: "Under 1K", min: 0, max: K },
  { label: "1K–4K", min: K, max: 4 * K },
  { label: "4K–8K", min: 4 * K, max: 8 * K },
  { label: "8K–16K", min: 8 * K, max: DEVIN_CAP },
  { label: "16K–32K", min: DEVIN_CAP, max: CODEX_CAP },
  { label: "Over 32K", min: CODEX_CAP, max: Number.POSITIVE_INFINITY },
] as const;

const STAR_TIERS = [
  { label: "Under 10k ★", min: 0, max: 10_000 },
  { label: "10k–30k ★", min: 10_000, max: 30_000 },
  { label: "30k–100k ★", min: 30_000, max: 100_000 },
  { label: "100k+ ★", min: 100_000, max: Number.POSITIVE_INFINITY },
] as const;

export type Quantiles = { p10: number; p25: number; p50: number; p75: number; p90: number };
export type SizeGroup = { label: string; count: number; median: number | null };
export type SizeBucket = SizeGroup & { medianScore: number | null };
export type CapCount = { over: number; of: number };

export type AgentsMdSize = {
  measured: number;
  quantiles: Quantiles | null;
  buckets: SizeBucket[];
  byFile: SizeGroup[];
  /** Root AGENTS.md files only: Devin and Codex don't read CLAUDE.md for their caps. */
  devin: CapCount;
  codex: CapCount;
  byStars: SizeGroup[];
  byLanguage: (SizeGroup & { slug: string })[];
  /** Median overall score of board repos with no file, or only an empty one. */
  medianScoreWithout: number | null;
};

type Measured = ExampleRow & { length: number };

/** Nearest-rank percentile of an ascending list. */
export function percentile(sorted: number[], p: number): number {
  const i = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[i];
}

/** Whole percent of the measured files shorter than `length`. */
export function longerThan(length: number, rows: { length: number | null }[]): number {
  const measured = rows.filter((r) => r.length != null);
  const shorter = measured.filter((r) => (r.length as number) < length).length;
  return measured.length === 0 ? 0 : Math.floor((shorter * 100) / measured.length);
}

const scores = (rows: { score: number | null }[]) => rows.flatMap((r) => (r.score == null ? [] : [r.score]));
const lengths = (rows: Measured[]) => rows.map((r) => r.length);

function group(label: string, rows: Measured[]): SizeGroup {
  return { label, count: rows.length, median: median(lengths(rows)) };
}

// The check matches case-insensitively, so one name is stored in several spellings.
const isFile = (r: ExampleRow, name: string) => r.file.toLowerCase() === name.toLowerCase();

export function buildAgentsMdSize(rows: ExampleRow[], board: LeaderboardRow[]): AgentsMdSize {
  const measured = rows.filter((r): r is Measured => r.length != null);
  const sorted = lengths(measured).sort((a, b) => a - b);
  const agentsMd = measured.filter((r) => isFile(r, "AGENTS.md"));
  const withFile = new Set(rows.map((r) => r.id));

  const languages = new Map<string, Measured[]>();
  for (const r of measured) {
    if (r.language == null) continue;
    languages.set(r.language, [...(languages.get(r.language) ?? []), r]);
  }

  return {
    measured: measured.length,
    quantiles:
      sorted.length === 0
        ? null
        : {
            p10: percentile(sorted, 10),
            p25: percentile(sorted, 25),
            p50: median(sorted) ?? 0,
            p75: percentile(sorted, 75),
            p90: percentile(sorted, 90),
          },
    buckets: SIZE_BUCKETS.map((b) => {
      const inside = measured.filter((r) => r.length >= b.min && r.length < b.max);
      return { ...group(b.label, inside), medianScore: median(scores(inside)) };
    }),
    byFile: [
      group("AGENTS.md", agentsMd),
      // AGENTS.md is the check's first pick, so a CLAUDE.md is measured only where there is none.
      group(
        "CLAUDE.md only",
        measured.filter((r) => isFile(r, "CLAUDE.md")),
      ),
    ].filter((g) => g.count > 0),
    devin: { over: agentsMd.filter((r) => r.length > DEVIN_CAP).length, of: agentsMd.length },
    codex: { over: agentsMd.filter((r) => r.length > CODEX_CAP).length, of: agentsMd.length },
    byStars: STAR_TIERS.map((t) =>
      group(
        t.label,
        measured.filter((r) => (r.stars ?? 0) >= t.min && (r.stars ?? 0) < t.max),
      ),
    ).filter((g) => g.count > 0),
    byLanguage: [...languages.entries()]
      .filter(([, rs]) => rs.length >= SIZE_GROUP_MIN)
      .map(([label, rs]) => ({ ...group(label, rs), slug: languageSlug(label) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, SIZE_LANGUAGE_LIMIT),
    medianScoreWithout: median(scores(board.filter((r) => !withFile.has(r.id)))),
  };
}

export function sizeTitle(measured: number): string {
  return `How long should an AGENTS.md be? Sizes of ${measured} real files`;
}

export function sizeDescription(s: Pick<AgentsMdSize, "measured" | "quantiles">): string {
  const mid = s.quantiles?.p50.toLocaleString("en-US") ?? "—";
  return fitDescription(
    `The median AGENTS.md or CLAUDE.md in ${s.measured} open source repos is ${mid} characters.`,
    "The spread, files over Devin's and Codex's caps, and what the docs advise.",
  );
}

import { topImprovements } from "@/lib/scoring/scorer";
import type { SignalResult } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import type { LeaderboardRow, RepoRow } from "@/lib/types/db";
import { averageScore, languageSlug } from "@/lib/utils/language";
import { readers } from "@/lib/utils/readers";
import type { RepoSummary } from "@/lib/utils/repo-summary";

/** Share of repos (0–1) that pass a check in full, across the board and in this repo's language hub. */
export type CheckRates = Record<string, { all: number; language: number | null }>;

// Only what the rest of the repo page doesn't show: score, rank, files found
// and per-agent scores are already in "At a glance" and "All checks", and
// repeating them here read as filler.
export type RepoReportData = {
  comparisons: { against: string; average: number; diff: number }[];
  starsRank: { rank: number; total: number; language: string } | null;
  language: string | null;
  missing: { label: string; all: number; language: number | null }[];
  rare: { label: string; all: number }[];
  lift: { label: string; agents: number; maxGain: number } | null;
};

const MISSING_LISTED = 3;

// The agent instructions panel already says whether the repo has one and how
// many repos do.
const COVERED_ELSEWHERE = new Set(["agents_md"]);

function standing(repo: RepoRow, summary: RepoSummary, board: LeaderboardRow[]) {
  const overall = repo.overall_score ?? 0;
  const lr = summary.languageRank;
  const peers =
    lr && repo.language
      ? board.filter((r) => r.language && languageSlug(r.language) === languageSlug(repo.language as string))
      : [];

  const avg = averageScore(board);
  const comparisons = [{ against: "leaderboard average", average: avg, diff: overall - avg }];
  let starsRank: RepoReportData["starsRank"] = null;

  if (lr && peers.length > 0) {
    const langAvg = averageScore(peers);
    comparisons.push({ against: `${lr.language} average`, average: langAvg, diff: overall - langAvg });
    if (repo.stars != null) {
      const rank = peers.filter((r) => (r.stars ?? 0) > (repo.stars ?? 0)).length + 1;
      starsRank = { rank, total: lr.total, language: lr.language };
    }
  }
  return { comparisons, starsRank };
}

// "What to fix first" ranks fixes for one agent at a time; this is the one
// fix that helps the most of them.
function lift(signals: SignalResult[]): RepoReportData["lift"] {
  const gains = new Map<string, { label: string; agents: number; maxGain: number }>();
  for (const m of MODELS) {
    for (const g of topImprovements(m.id, signals, signals.length)) {
      const e = gains.get(g.signalId) ?? { label: g.label, agents: 0, maxGain: 0 };
      gains.set(g.signalId, { ...e, agents: e.agents + 1, maxGain: Math.max(e.maxGain, g.scoreGain) });
    }
  }
  const broadest = [...gains.values()].sort((a, b) => b.agents - a.agents || b.maxGain - a.maxGain)[0];
  return broadest && broadest.agents > 1 ? broadest : null;
}

/** This repo's results set against the board, so no two repo pages read alike. */
export function buildRepoReport(args: {
  repo: RepoRow;
  summary: RepoSummary;
  board: LeaderboardRow[];
  signals: SignalResult[];
  rates: CheckRates;
}): RepoReportData {
  const { repo, summary, board, signals, rates } = args;

  // Single-agent files (GEMINI.md, .aider.conf.yml) are already the per-agent
  // "biggest fix"; listed here they repeated across most pages.
  const missing = signals
    .filter((s) => s.pass === 0 && readers(s.id) > 1 && rates[s.id] && !COVERED_ELSEWHERE.has(s.id))
    .sort((a, b) => rates[b.id].all - rates[a.id].all)
    .slice(0, MISSING_LISTED)
    .map((s) => ({ label: s.label, ...rates[s.id] }));

  // Compared as printed, or a 49.6% rate shows as "less common … 50%".
  const rare = signals
    .filter((s) => s.pass >= 1 && rates[s.id] && !COVERED_ELSEWHERE.has(s.id) && Math.round(rates[s.id].all * 100) < 50)
    .map((s) => ({ label: s.label, all: rates[s.id].all }));

  return {
    ...standing(repo, summary, board),
    language: summary.languageRank?.language ?? null,
    missing,
    rare,
    lift: lift(signals),
  };
}

import { topImprovements } from "@/lib/scoring/scorer";
import type { SignalResult } from "@/lib/scoring/signals";
import { MODELS, type ModelProfile } from "@/lib/scoring/weights";
import type { LeaderboardRow, ModelScoreRow, RepoRow } from "@/lib/types/db";
import { groupByLanguage, languageSlug } from "@/lib/utils/language";

const KEY_SIGNALS_PER_MODEL = 3;

type ModelFit = { model: ModelProfile; score: number };

export type RepoSummary = {
  rank: number;
  total: number;
  languageRank: { rank: number; total: number; language: string } | null;
  passing: number;
  signalCount: number;
  best: (ModelFit & { tiedWith: number }) | null;
  worst: ModelFit | null;
  worstGap: { label: string; scoreGain: number } | null;
};

// Position, not "count of higher scores + 1": the leaderboard numbers rows by
// position (ties broken by stars), and the two must show the same rank.
function positionOf(repoId: number, rows: LeaderboardRow[]): number {
  return rows.findIndex((r) => r.id === repoId) + 1;
}

export function summarizeRepo(
  repo: RepoRow,
  leaderboard: LeaderboardRow[],
  modelScores: ModelScoreRow[],
  signals: SignalResult[],
): RepoSummary | null {
  const rank = positionOf(repo.id, leaderboard);
  if (repo.overall_score == null || rank === 0) {
    return null;
  }

  // Compared by slug because hosts disagree on casing ("Java", "java"); the hubs group the same way.
  const slug = repo.language ? languageSlug(repo.language) : "";
  const sameLanguage = slug ? leaderboard.filter((r) => r.language && languageSlug(r.language) === slug) : [];

  const fits = MODELS.flatMap((model) => {
    const score = modelScores.find((s) => s.modelId === model.id)?.score;
    return score == null ? [] : [{ model, score }];
  }).sort((a, b) => b.score - a.score);

  const top = fits[0];
  const last = fits[fits.length - 1];
  const worst = top && last && last.score < top.score ? last : null;
  const gap = worst ? topImprovements(worst.model.id, signals, 1)[0] : undefined;

  return {
    rank,
    total: leaderboard.length,
    // A language with only this repo in it makes "#1 of 1", which reads as a boast, not a fact.
    languageRank:
      repo.language && sameLanguage.length > 1
        ? {
            rank: positionOf(repo.id, sameLanguage),
            total: sameLanguage.length,
            language: groupByLanguage(sameLanguage)[0].label,
          }
        : null,
    passing: signals.filter((s) => s.pass >= 1).length,
    signalCount: signals.length,
    best: top ? { ...top, tiedWith: fits.filter((f) => f.score === top.score).length - 1 } : null,
    worst,
    worstGap: gap ? { label: gap.label, scoreGain: gap.scoreGain } : null,
  };
}

export function keySignals(model: ModelProfile, signals: SignalResult[]): SignalResult[] {
  return signals
    .filter((s) => (model.weights[s.id] ?? 0) > 0)
    .sort((a, b) => (model.weights[b.id] ?? 0) - (model.weights[a.id] ?? 0))
    .slice(0, KEY_SIGNALS_PER_MODEL);
}

export function topPercent(summary: RepoSummary): number | null {
  const pct = Math.max(1, Math.round((summary.rank / summary.total) * 100));
  return pct <= 50 ? pct : null;
}

export function summaryDescription(slug: string, summary: RepoSummary | null, overall: number | null): string {
  if (!summary || overall == null) {
    return `How ready ${slug} is for ${MODELS.length} AI coding agents, and the changes that would help most.`;
  }

  const parts = [
    `${slug} scores ${overall.toFixed(1)} out of 100 for AI coding agents, #${summary.rank} of ${summary.total}.`,
  ];
  if (summary.best && summary.best.tiedWith === 0) {
    parts.push(`Scores highest for ${summary.best.model.label}.`);
  }
  if (summary.worst && summary.worstGap) {
    parts.push(`Biggest fix for ${summary.worst.model.label}: ${summary.worstGap.label}.`);
  }
  parts.push("See what to fix first.");

  return parts.join(" ");
}

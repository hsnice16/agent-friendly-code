import { relative } from "node:path";

import { DEFAULT_SUGGESTION_LIMIT } from "../constants/scoring";
import { runAllSignals, SIGNAL_BY_ID, type SignalResult } from "./signals";
import { MODEL_BY_ID, MODELS, type ModelId, type ModelProfile } from "./weights";

export type ModelScore = {
  score: number;
  modelId: ModelId;
  modelLabel: string;
  contributions: Array<{
    pass: number;
    weight: number;
    signalId: string;
    contribution: number;
  }>;
};

export type RepoScore = {
  overall: number;
  signals: SignalResult[];
  modelScores: ModelScore[];
};

function scoreOneModel(profile: ModelProfile, signals: SignalResult[]): ModelScore {
  let earned = 0;
  const contributions: ModelScore["contributions"] = [];
  const weightSum = Object.values(profile.weights).reduce((a, b) => a + b, 0);

  for (const s of signals) {
    const w = profile.weights[s.id] ?? 0;
    const contribution = s.pass * w;
    earned += contribution;

    contributions.push({
      weight: w,
      contribution,
      pass: s.pass,
      signalId: s.id,
    });
  }

  const score = weightSum === 0 ? 0 : (earned / weightSum) * 100;
  return {
    contributions,
    modelId: profile.id,
    modelLabel: profile.label,
    score: Math.round(score * 10) / 10,
  };
}

// Strip the absolute repo-root prefix so persisted/rendered paths never leak
// the scanner's local filesystem layout. Signals are written individually —
// some already return relative paths, some don't — normalising once here is
// the reliable belt-and-braces.
function toRelative(repoPath: string, p: string | undefined): string | undefined {
  if (!p) {
    return p;
  }

  const rel = relative(repoPath, p);
  return rel.startsWith("..") ? p : rel || ".";
}

export function scoreRepo(repoPath: string): RepoScore {
  const rawSignals = runAllSignals(repoPath);
  const signals = rawSignals.map((s) => ({
    ...s,
    matchedPath: toRelative(repoPath, s.matchedPath),
  }));
  const modelScores = MODELS.map((m) => scoreOneModel(m, signals));

  const overall = Math.round((modelScores.reduce((a, b) => a + b.score, 0) / modelScores.length) * 10) / 10;

  return { signals, modelScores, overall };
}

export type ImprovementSuggestion = {
  label: string;
  signalId: string;
  scoreGain: number;
  suggestion: string;
};

export function topImprovements(
  modelId: ModelId,
  signals: SignalResult[],
  limit = DEFAULT_SUGGESTION_LIMIT,
): ImprovementSuggestion[] {
  const profile = MODEL_BY_ID[modelId];
  if (!profile) {
    return [];
  }

  const weightSum = Object.values(profile.weights).reduce((a, b) => a + b, 0) || 1;

  return signals
    .map((s) => {
      const w = profile.weights[s.id] ?? 0;
      const scoreGain = (((1 - s.pass) * w) / weightSum) * 100;

      return { signalResult: s, scoreGain };
    })
    .filter((x) => x.scoreGain > 0)
    .sort((a, b) => b.scoreGain - a.scoreGain)
    .slice(0, limit)
    .map(({ signalResult, scoreGain }) => ({
      signalId: signalResult.id,
      label: signalResult.label,
      scoreGain: Math.round(scoreGain * 10) / 10,
      suggestion: SIGNAL_BY_ID[signalResult.id]?.improveSuggestion ?? "",
    }));
}

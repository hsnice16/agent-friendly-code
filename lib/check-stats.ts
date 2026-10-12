import { cache } from "react";

import { CHECK_EXAMPLES_LIMIT, CHECK_MISSING_LIMIT } from "./constants/scoring";
import { listLeaderboardOverall, listSignalPasses } from "./db";
import { MODELS, type ModelProfile } from "./scoring/weights";
import type { LeaderboardRow } from "./types/db";
import { groupByLanguage, isHub } from "./utils/language";

export type PassCounts = { total: number; full: number; partial: number; none: number };

export type CheckStats = PassCounts & {
  /** Highest-scoring repos that pass in full. */
  examples: LeaderboardRow[];
  /** Most-starred repos that fail outright. */
  missing: LeaderboardRow[];
  languages: { slug: string; label: string; counts: PassCounts }[];
  agents: { model: ModelProfile; share: number }[];
};

function count(passes: number[]): PassCounts {
  const full = passes.filter((p) => p >= 1).length;
  const none = passes.filter((p) => p === 0).length;
  return { total: passes.length, full, none, partial: passes.length - full - none };
}

export function fullRate(c: PassCounts): number {
  return c.total === 0 ? 0 : c.full / c.total;
}

export const getCheckStats = cache((signalId: string): CheckStats => {
  const passOf = new Map(listSignalPasses(signalId).map((r) => [r.repoId, r.pass]));
  // Leaderboard order is score-descending, which `examples` relies on.
  const rows = listLeaderboardOverall().filter((r) => passOf.has(r.id));
  const pass = (r: LeaderboardRow) => passOf.get(r.id) ?? 0;

  return {
    ...count(rows.map(pass)),
    examples: rows.filter((r) => pass(r) >= 1).slice(0, CHECK_EXAMPLES_LIMIT),
    missing: rows
      .filter((r) => pass(r) === 0)
      .sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0))
      .slice(0, CHECK_MISSING_LIMIT),
    languages: groupByLanguage(rows)
      .filter(isHub)
      .map((g) => ({ slug: g.slug, label: g.label, counts: count(g.rows.map(pass)) })),
    // Share of the agent's total weight, since the profiles do not sum to the same number.
    agents: MODELS.map((model) => {
      const sum = Object.values(model.weights).reduce((a, b) => a + b, 0);
      return { model, share: sum === 0 ? 0 : (model.weights[signalId] ?? 0) / sum };
    })
      .filter((a) => a.share > 0)
      .sort((a, b) => b.share - a.share),
  };
});

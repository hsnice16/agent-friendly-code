import { cache } from "react";

import { HUB_GAPS_LIMIT } from "./constants/scoring";
import { getSignalPassRates, listLeaderboardOverall } from "./db";
import { SIGNALS } from "./scoring/signals";
import type { LeaderboardRow, SignalPassRate } from "./types/db";
import { averageScore, groupByLanguage, isHub, type LanguageGroup } from "./utils/language";
import { readers } from "./utils/readers";

export type Hub = LanguageGroup<LeaderboardRow> & {
  average: number;
  top: LeaderboardRow;
  gaps: SignalPassRate[];
};

// A file only one agent reads (`.aider.conf.yml`, `GEMINI.md`, …) is missing
// from nearly every repo in every language, so it would top every hub's list
// and say nothing about the language.
const SHARED_SIGNALS = new Set(SIGNALS.map((s) => s.id).filter((id) => readers(id) > 1));

export const getLanguageGroups = cache(() => groupByLanguage(listLeaderboardOverall()));

export const getHub = cache((slug: string): Hub | null => {
  const group = getLanguageGroups().find((g) => g.slug === slug);
  if (!group || !isHub(group)) return null;

  const average = averageScore(group.rows);
  const gaps = getSignalPassRates(group.rows.map((r) => r.id))
    .filter((s) => SHARED_SIGNALS.has(s.id))
    .slice(0, HUB_GAPS_LIMIT);
  return { ...group, average, top: group.rows[0], gaps };
});

import { SCORE_THRESHOLD_GOOD, SCORE_THRESHOLD_MID } from "../constants/scoring";

export type ScoreTier = "good" | "mid" | "low";

export function scoreTier(n: number): ScoreTier {
  if (n >= SCORE_THRESHOLD_GOOD) {
    return "good";
  }

  if (n >= SCORE_THRESHOLD_MID) {
    return "mid";
  }

  return "low";
}

export const TIER_TEXT_CLASS: Record<ScoreTier, string> = {
  good: "text-ok",
  low: "text-bad",
  mid: "text-warn",
};

export const TIER_BG_CLASS: Record<ScoreTier, string> = {
  good: "bg-ok",
  low: "bg-bad",
  mid: "bg-warn",
};

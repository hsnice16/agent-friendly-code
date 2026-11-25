import type { PairSplit } from "./agent-scores";
import type { ComparePair } from "./compare-pairs";
import { MODEL_BY_ID } from "./scoring/weights";
import { fitDescription, MAX_TITLE_LENGTH } from "./utils/page-title";

/** Shortest-first fallbacks, so a long agent name cannot push a title past the limit. */
function firstFit(options: string[], max = MAX_TITLE_LENGTH): string {
  return options.find((t) => t.length <= max) ?? options[options.length - 1];
}

export function pairLabels(pair: ComparePair): { a: string; b: string } {
  return { a: MODEL_BY_ID[pair.a].label, b: MODEL_BY_ID[pair.b].label };
}

export function compareTitle(pair: ComparePair): string {
  const { a, b } = pairLabels(pair);
  return firstFit([
    `${a} vs ${b}: which do top repos set up for?`,
    `${a} vs ${b}: which do repos set up for?`,
    `${a} vs ${b}: repo setup`,
  ]);
}

export function compareDescription(pair: ComparePair, s: PairSplit): string {
  const { a, b } = pairLabels(pair);
  return fitDescription(
    `How ${s.n} popular repos are set up for ${a} and ${b}: ${s.avgA.toFixed(1)} vs ${s.avgB.toFixed(1)} on average.`,
    "The files each reads and the checks each weighs.",
    "Setup, not code quality.",
  );
}

/** The short answer, in words a searcher can quote. */
export function compareAnswer(pair: ComparePair, s: PairSplit): string {
  const { a, b } = pairLabels(pair);
  const lead =
    s.avgA.toFixed(1) === s.avgB.toFixed(1)
      ? `${a} and ${b} average the same`
      : `${s.avgA > s.avgB ? a : b} averages higher`;
  return `${lead}: ${s.avgA.toFixed(1)} for ${a} and ${s.avgB.toFixed(1)} for ${b}, across ${s.n} repos. ${a} scores higher on ${s.aHigher}, ${b} on ${s.bHigher}, and ${s.ties} tie.`;
}

export const COMPARE_HUB_DESCRIPTION =
  "Claude Code vs Cursor, Codex vs Gemini CLI and more: how well popular repos are set up for each AI coding agent, by score. Setup, not code quality.";

export function compareHubTitle(repos: number): string {
  return firstFit([`AI coding agents compared across ${repos} repos`, "AI coding agents compared"]);
}

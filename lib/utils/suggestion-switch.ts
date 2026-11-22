import type { ImprovementSuggestion } from "@/lib/scoring/scorer";

/** `[signalId, scoreGain]`, best first. */
export type Fix = [string, number];
export type SwitchAgent = { id: string; fixes: Fix[] };

/** Ids and gains only: the switch looks labels and fix text up in `MODEL_LABEL` and `SIGNAL_TEXT`. */
export function suggestionSwitchProps(agents: { id: string; label: string; suggestions: ImprovementSuggestion[] }[]): {
  agents: SwitchAgent[];
} {
  return {
    agents: agents.map((a) => ({
      id: a.id,
      fixes: a.suggestions.map((s): Fix => [s.signalId, s.scoreGain]),
    })),
  };
}

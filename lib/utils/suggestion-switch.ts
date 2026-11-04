import type { ImprovementSuggestion } from "@/lib/scoring/scorer";

/** `[signalId, scoreGain]`, best first. */
export type Fix = [string, number];
export type FixText = Pick<ImprovementSuggestion, "label" | "suggestion">;
export type SwitchAgent = { id: string; label: string; fixes: Fix[] };

/**
 * The agents share most fixes, so each fix's text is sent once: these props
 * are serialized into every repo page's HTML.
 */
export function suggestionSwitchProps(agents: { id: string; label: string; suggestions: ImprovementSuggestion[] }[]): {
  agents: SwitchAgent[];
  text: Record<string, FixText>;
} {
  const text: Record<string, FixText> = {};
  for (const a of agents) {
    for (const s of a.suggestions) text[s.signalId] = { label: s.label, suggestion: s.suggestion };
  }
  return {
    text,
    agents: agents.map((a) => ({
      id: a.id,
      label: a.label,
      fixes: a.suggestions.map((s): Fix => [s.signalId, s.scoreGain]),
    })),
  };
}

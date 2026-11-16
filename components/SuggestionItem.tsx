import type { ImprovementSuggestion } from "@/lib/scoring/scorer";

type Suggestion = Pick<ImprovementSuggestion, "label" | "suggestion" | "scoreGain">;

/** Goes in a `divide-y divide-line` list. */
export function SuggestionItem({ index, suggestion }: { index: number; suggestion: Suggestion }) {
  return (
    <li className="fix-row">
      <div className="glyph mt-0.5 size-[22px] bg-accent text-[11.5px] font-bold text-bg">{index + 1}</div>

      {/* Fix text like `.cursor/rules/*.mdc` has no break point; without these the
          row outgrows a phone screen and pushes the points off the edge. */}
      <div className="min-w-0 break-words">
        <div className="text-[15px] font-medium">{suggestion.label}</div>
        <div className="mt-1 text-[13.5px] leading-relaxed text-ink-dim">{suggestion.suggestion}</div>
      </div>

      {/* Under the text on phones: a column of its own leaves the fix a word per line. */}
      <div className="fix-impact">+{suggestion.scoreGain.toFixed(1)} pts</div>
    </li>
  );
}

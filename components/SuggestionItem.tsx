import type { ImprovementSuggestion } from "@/lib/scoring/scorer";

export function SuggestionItem({ index, suggestion }: { index: number; suggestion: ImprovementSuggestion }) {
  return (
    <li className="grid grid-cols-[22px_minmax(0,1fr)] gap-x-3.5 gap-y-1 border-b border-line py-3.5 last:border-b-0 sm:grid-cols-[22px_minmax(0,1fr)_auto]">
      <div className="mt-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-accent text-[11.5px] font-bold text-bg">
        {index + 1}
      </div>

      {/* Fix text like `.cursor/rules/*.mdc` has no break point; without these the
          row outgrows a phone screen and pushes the points off the edge. */}
      <div className="min-w-0 break-words">
        <div className="text-[15px] font-medium">{suggestion.label}</div>
        <div className="mt-1 text-sm leading-relaxed text-ink-dim">{suggestion.suggestion}</div>
      </div>

      {/* Under the text on phones: a column of its own leaves the fix a word per line. */}
      <div className="col-start-2 shrink-0 whitespace-nowrap text-sm sm:col-start-auto sm:self-center font-semibold tabular-nums text-ok">
        +{suggestion.scoreGain.toFixed(1)} pts
      </div>
    </li>
  );
}

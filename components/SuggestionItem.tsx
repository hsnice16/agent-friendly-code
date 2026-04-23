import type { ImprovementSuggestion } from "@/lib/scoring/scorer";

export function SuggestionItem({ index, suggestion }: { index: number; suggestion: ImprovementSuggestion }) {
  return (
    <li className="grid grid-cols-[22px_1fr_auto] gap-3.5 border-b border-line py-3.5 last:border-b-0">
      <div className="mt-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-accent text-[11.5px] font-bold text-bg">
        {index + 1}
      </div>
      <div>
        <div className="text-[15px] font-medium">{suggestion.label}</div>
        <div className="mt-1 text-sm leading-relaxed text-ink-dim">{suggestion.suggestion}</div>
      </div>
      <div className="shrink-0 self-center whitespace-nowrap text-sm font-semibold tabular-nums text-ok">
        +{suggestion.scoreGain.toFixed(1)} pts
      </div>
    </li>
  );
}

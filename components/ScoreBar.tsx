import { scoreTier, TIER_BG_CLASS } from "@/lib/utils/score";

export function ScoreBar({ score, width = 100 }: { score: number; width?: number }) {
  const tier = scoreTier(score);
  const pct = Math.max(0, Math.min(100, score));

  return (
    <div
      style={{ width }}
      aria-valuemin={0}
      role="progressbar"
      aria-valuemax={100}
      aria-valuenow={Math.round(score)}
      aria-label={`Score ${score.toFixed(1)} out of 100`}
      className="relative h-[7px] overflow-hidden rounded-sm bg-line"
    >
      <div style={{ width: `${pct}%` }} className={`h-full rounded-sm ${TIER_BG_CLASS[tier]}`} />
    </div>
  );
}

import { scoreTier, TIER_BG_CLASS } from "@/lib/utils/score";

export function ScoreBar({ score, width = 100, className }: { score: number; width?: number; className?: string }) {
  const tier = scoreTier(score);
  const pct = Math.max(0, Math.min(100, score));

  return (
    <div
      aria-valuemin={0}
      style={{ width }}
      role="progressbar"
      aria-valuemax={100}
      aria-valuenow={Math.round(score)}
      aria-label={`Score ${score.toFixed(1)} out of 100`}
      className={className ? `relative bar-track ${className}` : "relative bar-track"}
    >
      <div style={{ width: `${pct}%` }} className={`bar-fill ${TIER_BG_CLASS[tier]}`} />
    </div>
  );
}

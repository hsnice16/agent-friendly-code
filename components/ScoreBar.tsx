import { scoreTier, TIER_BG_CLASS } from "@/lib/utils/score";

export function ScoreBar({ score }: { score: number }) {
  const tier = scoreTier(score);
  const pct = Math.max(0, Math.min(100, score));

  return (
    <div
      aria-valuemin={0}
      role="progressbar"
      aria-valuemax={100}
      aria-valuenow={Math.round(score)}
      aria-label={`Score ${score.toFixed(1)} out of 100`}
      className="relative bar-track w-[100px]"
    >
      <div style={{ width: `${pct}%` }} className={`bar-fill ${TIER_BG_CLASS[tier]}`} />
    </div>
  );
}

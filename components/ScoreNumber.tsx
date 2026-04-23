import { scoreTier, TIER_TEXT_CLASS } from "@/lib/utils/score";

export function ScoreNumber({ score, size = "base" }: { score: number; size?: "sm" | "base" | "xl" }) {
  const tier = scoreTier(score);

  const sizeClass =
    size === "xl" ? "text-[42px] leading-none tracking-tight" : size === "sm" ? "text-sm" : "text-[15px]";

  return <span className={`font-semibold tabular-nums ${sizeClass} ${TIER_TEXT_CLASS[tier]}`}>{score.toFixed(1)}</span>;
}

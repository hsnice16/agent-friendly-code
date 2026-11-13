import { BADGE_HEIGHT, BADGE_LABEL, badgeWidth } from "@/lib/utils/badge";

/** Sized up front so the badge doesn't shift the card when it loads. */
export function BadgePreview({ slug, score }: { slug: string; score: number | null }) {
  return (
    <img
      width={badgeWidth(BADGE_LABEL, score == null ? "—" : score.toFixed(1))}
      height={BADGE_HEIGHT}
      src={`/api/badge/${slug}.svg`}
      alt={`Agent friendly score for ${slug}`}
      loading="lazy"
    />
  );
}

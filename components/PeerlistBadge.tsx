import { PEERLIST_URL } from "@/lib/version";

const PEERLIST_BADGE_SRC =
  "https://peerlist.io/api/v1/projects/embed/PRJHEOGJL88NAG6G9CRL6RR9ANEEEJ?showUpvote=true&theme=light";
const PEERLIST_BADGE_ALT = "Agent Friendly Code on Peerlist";

type Props = {
  className?: string;
};

export function PeerlistBadge({ className }: Props) {
  return (
    <a target="_blank" href={PEERLIST_URL} className={`hover:opacity-80 ${className ?? ""}`} rel="noopener noreferrer">
      {/* Lazy: React preloads every eager <img> in the head, which put this footer badge ahead of the page's own requests. */}
      <img
        width={180}
        height={54}
        alt={PEERLIST_BADGE_ALT}
        src={PEERLIST_BADGE_SRC}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        // Product Hunt's badge height, so the two sit as one row.
        className="h-[54px] w-auto"
      />
      <span className="sr-only"> (new tab)</span>
    </a>
  );
}

const PEERLIST_PROJECT_URL = "https://peerlist.io/hsnice16/project/agent-friendly-code";
const PEERLIST_BADGE_SRC =
  "https://peerlist.io/api/v1/projects/embed/PRJHEOGJL88NAG6G9CRL6RR9ANEEEJ?showUpvote=true&theme=light";
const PEERLIST_BADGE_ALT = "Agent Friendly Code on Peerlist";

type Props = {
  className?: string;
};

export function PeerlistBadge({ className }: Props) {
  return (
    <a target="_blank" href={PEERLIST_PROJECT_URL} className={className} rel="noopener noreferrer">
      {/* Remote Peerlist embed — plain <img> like ProductHuntBadge; no next/image remote config needed.
          Lazy: React preloads every eager <img> in the head, which put this footer badge ahead of the page's own requests. */}
      <img
        width={240}
        height={72}
        alt={PEERLIST_BADGE_ALT}
        src={PEERLIST_BADGE_SRC}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        className="h-[72px] w-auto"
      />
    </a>
  );
}

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
      {/* Remote Peerlist embed — plain <img> like ProductHuntBadge; no next/image remote config needed. */}
      <img className="h-[72px] w-auto" alt={PEERLIST_BADGE_ALT} src={PEERLIST_BADGE_SRC} />
    </a>
  );
}

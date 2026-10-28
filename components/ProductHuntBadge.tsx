const PH_POST_URL =
  "https://www.producthunt.com/products/agent-friendly-code?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-agent-friendly-code";
const PH_BADGE_SRC =
  "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1184430&theme=neutral&t=1782808971713";
const PH_BADGE_ALT = "Agent Friendly Code - Is your codebase ready for AI coding agents? | Product Hunt";

type Props = {
  className?: string;
};

export function ProductHuntBadge({ className }: Props) {
  return (
    <a target="_blank" href={PH_POST_URL} className={className} rel="noopener noreferrer">
      {/* Lazy: React preloads every eager <img> in the head, which put this footer badge ahead of the page's own requests. */}
      <img
        width={250}
        height={54}
        alt={PH_BADGE_ALT}
        src={PH_BADGE_SRC}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
      />
    </a>
  );
}

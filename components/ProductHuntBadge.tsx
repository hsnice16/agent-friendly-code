const PH_POST_URL =
  "https://www.producthunt.com/products/agent-friendly-code?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-agent-friendly-code";
const PH_BADGE_SRC =
  "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1184430&theme=neutral&t=1782808971713";
const PH_BADGE_ALT = "Agent Friendly Code - Which public repos are friendliest to an AI coding agent? | Product Hunt";

type Props = {
  className?: string;
};

export function ProductHuntBadge({ className }: Props) {
  return (
    <a target="_blank" href={PH_POST_URL} className={className} rel="noopener noreferrer">
      {/* Remote PH badge SVG — plain <img> like BadgeEmbed; no next/image remote config needed. */}
      <img width={250} height={54} alt={PH_BADGE_ALT} src={PH_BADGE_SRC} />
    </a>
  );
}

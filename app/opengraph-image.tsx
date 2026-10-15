import { getLeaderboardStats } from "@/lib/db";
import { ogCard, ogSiteUrl } from "@/lib/og-card";
import { agentList } from "@/lib/utils/agent-list";
import { DEFAULT_OG_IMAGE, OG_IMAGE_SIZE } from "@/lib/version";

export const contentType = "image/png";
export const alt = DEFAULT_OG_IMAGE.alt;
export const size = OG_IMAGE_SIZE;

export default function Image() {
  const { count } = getLeaderboardStats();

  return ogCard({
    heading: ["How ready is your codebase", "for AI coding agents?"],
    sub: `One score per agent, from file checks: ${agentList()}.`,
    footerLeft: count > 0 ? `${count} repos scored for each agent` : "Scored for each agent",
    footerRight: ogSiteUrl(),
  });
}

import type { LeaderboardView } from "@/lib/leaderboard-view";
import { SIGNALS } from "@/lib/scoring/signals";
import { agentList } from "@/lib/utils/agent-list";
import { boardItemList } from "@/lib/utils/board-item-list";
import { APP_NAME, APP_URL, APP_VERSION } from "@/lib/version";

import { JsonLd } from "./JsonLd";

type HomeJsonLdProps = {
  view: Pick<LeaderboardView, "page" | "filtered" | "filteredRows">;
  contentChangedAt: number | null;
};

/**
 * The Dataset is the whole leaderboard (its download is /api/repos), so only
 * the canonical home carries it: on page 2+ or a re-cut it would be a second
 * copy of one dataset at a URL that shows a slice of it. Organization, WebSite
 * and WebApplication are site-wide and live in app/layout.tsx. No mainEntity:
 * the page's ItemList is one page of rows, not the dataset.
 */
export function homeJsonLdGraph({ view, contentChangedAt }: HomeJsonLdProps): Record<string, unknown>[] {
  const itemList = boardItemList(view, "Agent-friendliness leaderboard");
  if (!itemList) {
    return [];
  }
  if (view.page > 1) {
    return [itemList];
  }
  return [
    itemList,
    {
      "@type": "Dataset",
      "@id": `${APP_URL}/#dataset`,
      name: `${APP_NAME} — public repository scoring dataset`,
      description: `Scores for public GitHub, GitLab, and Bitbucket repos showing how easy each one is for AI coding agents to work in, with a separate score for ${agentList()}. Each repo gets ${SIGNALS.length} file checks: ${SIGNALS.map((s) => s.label).join(", ")}.`,
      url: APP_URL,
      version: APP_VERSION,
      keywords: ["AI coding agents", "AGENTS.md", "CLAUDE.md", "agent readiness", "open source repositories"],
      isAccessibleForFree: true,
      ...(contentChangedAt != null ? { dateModified: new Date(contentChangedAt * 1000).toISOString() } : {}),
      creator: { "@type": "Organization", name: APP_NAME, url: APP_URL },
      license: "https://opensource.org/licenses/MIT",
      distribution: {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: `${APP_URL}/api/repos`,
      },
      variableMeasured: SIGNALS.map((s) => s.label),
    },
  ];
}

export function HomeJsonLd(props: HomeJsonLdProps) {
  const graph = homeJsonLdGraph(props);
  if (graph.length === 0) {
    return null;
  }

  return <JsonLd data={{ "@graph": graph }} />;
}

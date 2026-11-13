import Link from "next/link";

import { HOSTS_TEXT, modelBoardTitle } from "@/lib/leaderboard-meta";
import type { ModelPanel } from "@/lib/leaderboard-model-panel";
import type { LeaderboardView } from "@/lib/leaderboard-view";
import { MODEL_BY_ID, type ModelId } from "@/lib/scoring/weights";
import type { LeaderboardStats } from "@/lib/types/db";
import { boardItemList } from "@/lib/utils/board-item-list";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { repoPath } from "@/lib/utils/repo-path";
import { JsonLd } from "./JsonLd";
import { LeaderboardBoard } from "./LeaderboardBoard";
import { ModelReadsPanel } from "./ModelReadsPanel";
import { PageHeader } from "./PageHeader";

type Props = { model: ModelId; view: LeaderboardView; stats: LeaderboardStats; panel: ModelPanel };

export function ModelLeaderboard({ model, view, stats, panel }: Props) {
  const profile = MODEL_BY_ID[model];
  const { label } = profile;
  const top = view.allRows[0];
  const itemList = boardItemList(view, modelBoardTitle(label));

  return (
    <>
      {itemList && <JsonLd data={itemList} />}

      <PageHeader
        crumbs={{ current: { name: label, path: modelPath(model) } }}
        title={`Which public repos are easiest for ${label} to work in?`}
        lead={
          <>
            {panel.why && `${panel.why} `}
            Repos from {HOSTS_TEXT}, ranked by their {label} score.
            {top && (
              <>
                {" "}
                <Link href={repoPath(top)} className="prose-link">
                  {top.owner}/{top.name}
                </Link>{" "}
                leads with <strong className="text-ink">{(top.score ?? 0).toFixed(1)}</strong>.
              </>
            )}
          </>
        }
      />

      <ModelReadsPanel model={profile} panel={panel} />

      <LeaderboardBoard view={view} stats={stats} />
    </>
  );
}

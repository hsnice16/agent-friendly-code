import Link from "next/link";

import { HOSTS_TEXT, modelBoardTitle } from "@/lib/leaderboard-meta";
import type { ModelPanel } from "@/lib/leaderboard-model-panel";
import type { LeaderboardView } from "@/lib/leaderboard-view";
import { MODEL_BY_ID, type ModelId } from "@/lib/scoring/weights";
import type { LeaderboardStats } from "@/lib/types/db";
import { boardItemList } from "@/lib/utils/board-item-list";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { repoPath } from "@/lib/utils/repo-path";
import { BreadcrumbJsonLd } from "./BreadcrumbJsonLd";
import { JsonLd } from "./JsonLd";
import { LeaderboardBoard } from "./LeaderboardBoard";
import { ModelReadsPanel } from "./ModelReadsPanel";

type Props = { model: ModelId; view: LeaderboardView; stats: LeaderboardStats; panel: ModelPanel };

export function ModelLeaderboard({ model, view, stats, panel }: Props) {
  const profile = MODEL_BY_ID[model];
  const { label } = profile;
  const top = view.allRows[0];
  const itemList = boardItemList(view, modelBoardTitle(label));

  return (
    <>
      <BreadcrumbJsonLd current={{ name: label, path: modelPath(model) }} />
      {itemList && <JsonLd data={itemList} />}

      <section className="mb-5">
        <h1 className="mb-3 text-[26px] font-bold leading-[1.2] tracking-tight sm:text-[32px] sm:leading-[1.18]">
          Which public repos are easiest for {label} to work in?
        </h1>

        <p className="m-0 max-w-[68ch] text-[15px] text-ink-dim sm:text-base">
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
        </p>
      </section>

      <ModelReadsPanel model={profile} panel={panel} />

      <LeaderboardBoard view={view} stats={stats} />
    </>
  );
}

import type { ExampleLink } from "@/lib/agents-md-example-links";
import { boardLeader, HOSTS_TEXT, modelBoardTitle, pageRanks } from "@/lib/leaderboard-meta";
import type { ModelPanel } from "@/lib/leaderboard-model-panel";
import type { LeaderboardView } from "@/lib/leaderboard-view";
import { MODEL_BY_ID, type ModelId } from "@/lib/scoring/weights";
import type { LeaderboardStats } from "@/lib/types/db";
import { boardItemList } from "@/lib/utils/board-item-list";
import { modelPath } from "@/lib/utils/leaderboard-href";

import { BoardIntentBridge } from "./BoardIntentBridge";
import { BoardKeyStat } from "./BoardKeyStat";
import { CodeText } from "./CodeText";
import { IntentLink } from "./IntentLink";
import { JsonLd } from "./JsonLd";
import { LeaderboardBoard } from "./LeaderboardBoard";
import { LeaderClause } from "./LeaderClause";
import { ModelReadsPanel } from "./ModelReadsPanel";
import { PageHeader } from "./PageHeader";

type Props = {
  model: ModelId;
  view: LeaderboardView;
  stats: LeaderboardStats;
  /** Page 1 only. */
  panel?: ModelPanel;
  examples?: ExampleLink[];
};

export function ModelLeaderboard({ model, view, stats, panel, examples }: Props) {
  const profile = MODEL_BY_ID[model];
  const { label } = profile;
  const itemList = boardItemList(view, modelBoardTitle(label));
  const crumbs = { current: { name: label, path: modelPath(model) } };

  if (view.page > 1) {
    const { first, last } = pageRanks(view);
    return (
      <>
        {itemList && <JsonLd data={itemList} />}
        <PageHeader
          crumbs={crumbs}
          title={`${label} leaderboard: ranks ${first}–${last}`}
          lead={
            <>
              Page {view.page} of {view.totalPages}, ranked by {label} score.{" "}
              <IntentLink href={modelPath(model)} className="prose-link">
                Top repos and what {label} reads
              </IntentLink>
            </>
          }
        />
        <LeaderboardBoard view={view} stats={stats} rationale={false} />
      </>
    );
  }

  const top = boardLeader(view.allRows);

  return (
    <>
      {itemList && <JsonLd data={itemList} />}

      <PageHeader
        crumbs={crumbs}
        title={`Which public repos are easiest for ${label} to work in?`}
        lead={
          <>
            Repos from {HOSTS_TEXT}, ranked by their {label} score.
            {top && <LeaderClause top={top} />}
          </>
        }
      >
        <BoardKeyStat claudeMd={model === "claude-code"} />
        <BoardIntentBridge model={model} />
      </PageHeader>

      <h2 className="m-0 mb-3 text-[18px] font-semibold tracking-tight">Top repos for {label}</h2>
      <LeaderboardBoard view={view} stats={stats} rationale={false} />

      <div className="mt-8 mb-4 max-w-[80ch] text-[14px] leading-[1.55] text-muted">
        {panel?.why && <p className="m-0 mb-2 text-ink-dim">{panel.why}</p>}
        <p className="m-0">
          <strong className="text-ink-dim">{label}</strong> — <CodeText text={profile.rationale} />
        </p>
      </div>

      {panel && <ModelReadsPanel model={profile} panel={panel} examples={examples} />}
    </>
  );
}

import { type ScoreSummary, type RepoSummary as Summary, topPercent } from "@/lib/utils/repo-summary";

import { Panel, PanelHeading } from "./Panel";
import { ScoreNumber } from "./ScoreNumber";
import { Stat } from "./Stat";

const GRID_COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

function OutOf({ n, total }: { n: string | number; total: number }) {
  return (
    <>
      {n} <span className="text-[14px] font-normal text-muted">of {total}</span>
    </>
  );
}

function RankStat({ summary }: { summary: Summary }) {
  const { rank, total, languageRank } = summary;
  const top = topPercent(summary);
  const note = [
    top != null ? `Top ${top}%` : null,
    languageRank ? `#${languageRank.rank} of ${languageRank.total} ${languageRank.language} repos` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return <Stat label="Rank" value={<OutOf n={`#${rank}`} total={total} />} note={note || undefined} />;
}

export function RepoSummary({ summary }: { summary: Summary | ScoreSummary }) {
  const { passing, signalCount, best, worst, worstGap } = summary;

  const cards = [
    "rank" in summary && <RankStat key="rank" summary={summary} />,
    <Stat
      key="checks"
      label="Checks passed"
      value={<OutOf n={passing} total={signalCount} />}
      note="Full list below"
    />,
    best && (
      <Stat
        key="best"
        label="Best set up for"
        value={best.tiedWith > 0 ? `${best.model.label} + ${best.tiedWith} more` : best.model.label}
        note={
          <>
            Score <ScoreNumber score={best.score} size="sm" />
          </>
        }
      />
    ),
    worst && (
      <Stat
        key="worst"
        label="Needs most work for"
        value={worst.model.label}
        note={
          worstGap ? (
            `Biggest fix: ${worstGap.label} (+${worstGap.scoreGain.toFixed(1)} pts)`
          ) : (
            <>
              Score <ScoreNumber score={worst.score} size="sm" />
            </>
          )
        }
      />
    ),
  ].filter(Boolean);

  return (
    <Panel>
      <PanelHeading>At a glance</PanelHeading>

      <dl className={`m-0 grid grid-cols-1 gap-2.5 ${GRID_COLS[cards.length] ?? ""}`}>{cards}</dl>
    </Panel>
  );
}

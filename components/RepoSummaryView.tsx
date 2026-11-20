"use client";

import { Panel, PanelHeading } from "./Panel";
import { ScoreNumber } from "./ScoreNumber";
import { Stat } from "./Stat";

const GRID_COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export type Props = {
  /** Absent on a live score, which has no board rank. */
  rank?: { rank: number; total: number; note: string };
  passing: number;
  signalCount: number;
  best: { label: string; score: number } | null;
  /** `fix` is the biggest gain, already worded; without one the card shows the score. */
  worst: { label: string; score: number; fix: string | null } | null;
};

function OutOf({ n, total }: { n: string | number; total: number }) {
  return (
    <>
      {n} <span className="text-[14px] font-normal text-muted">of {total}</span>
    </>
  );
}

export function RepoSummaryView({ rank, passing, signalCount, best, worst }: Props) {
  const cards = [
    rank && (
      <Stat
        key="rank"
        label="Rank"
        value={<OutOf n={`#${rank.rank}`} total={rank.total} />}
        note={rank.note || undefined}
      />
    ),
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
        value={best.label}
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
        value={worst.label}
        note={
          worst.fix ?? (
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

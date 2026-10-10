import { type RepoSummary as Summary, topPercent } from "@/lib/utils/repo-summary";

import { Panel, PanelHeading } from "./Panel";
import { ScoreNumber } from "./ScoreNumber";

const GRID_COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

function Stat({ label, value, note }: { label: string; value: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 px-3.5 py-3">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{label}</dt>
      <dd className="m-0 mt-1.5 text-[18px] font-semibold leading-tight tracking-tight text-ink">{value}</dd>
      {note && <dd className="m-0 mt-1 text-[13px] text-muted">{note}</dd>}
    </div>
  );
}

function OutOf({ n, total }: { n: string | number; total: number }) {
  return (
    <>
      {n} <span className="text-[14px] font-normal text-muted">of {total}</span>
    </>
  );
}

export function RepoSummary({ summary }: { summary: Summary }) {
  const { rank, total, languageRank, passing, signalCount, best, worst, worstGap } = summary;
  const top = topPercent(summary);
  const rankNote = [
    top != null ? `Top ${top}%` : null,
    languageRank ? `#${languageRank.rank} of ${languageRank.total} ${languageRank.language} repos` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const cards = [
    <Stat key="rank" label="Rank" value={<OutOf n={`#${rank}`} total={total} />} note={rankNote || undefined} />,
    <Stat
      key="checks"
      label="Checks passed"
      value={<OutOf n={passing} total={signalCount} />}
      note="Full list below"
    />,
    best && (
      <Stat
        key="best"
        label="Scores highest for"
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

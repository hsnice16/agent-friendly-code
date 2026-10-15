import { MODELS } from "@/lib/scoring/weights";
import { percent } from "@/lib/utils/format";
import type { RepoReportData } from "@/lib/utils/repo-report";

import { Panel, PanelHeading } from "./Panel";
import { Stat } from "./RepoSummary";

function Diff({ diff }: { diff: number }) {
  if (Math.abs(diff) < 0.05) return <>Level</>;

  const up = diff > 0;
  return (
    <span className={up ? "text-ok" : "text-bad"}>
      {Math.abs(diff).toFixed(1)}{" "}
      <span className="text-[14px] font-normal text-muted">pts {up ? "above" : "below"}</span>
    </span>
  );
}

// The sentence carries the number; the bar is only there to compare rows at a glance.
function RateRow({ label, share, text }: { label: string; share: number; text: string }) {
  return (
    <li className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-center sm:gap-4">
      <div className="min-w-0">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-muted"> · {text}</span>
      </div>
      <div aria-hidden className="h-[7px] overflow-hidden rounded-sm bg-line">
        <div className="h-full rounded-sm bg-muted" style={{ width: percent(share, 1) }} />
      </div>
    </li>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="m-0 mb-2 text-[13px] font-semibold text-ink-soft">{children}</h3>;
}

export function RepoReport({ slug, report }: { slug: string; report: RepoReportData }) {
  const { comparisons, starsRank, language, missing, rare, lift } = report;

  return (
    <Panel>
      <PanelHeading>How {slug} compares</PanelHeading>

      <dl className="m-0 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {comparisons.map((c) => (
          <Stat
            key={c.against}
            label={`vs ${c.against}`}
            value={<Diff diff={c.diff} />}
            note={`Average ${c.average.toFixed(1)}`}
          />
        ))}
        {starsRank && (
          <Stat
            label={`Stars among ${starsRank.language} repos`}
            value={
              <>
                #{starsRank.rank} <span className="text-[14px] font-normal text-muted">of {starsRank.total}</span>
              </>
            }
          />
        )}
      </dl>

      {missing.length > 0 && (
        <div className="mt-5">
          <SubHeading>Missing here, and how many repos have it</SubHeading>
          <ul className="m-0 list-none space-y-2.5 p-0 text-[14px]">
            {missing.map((m) => (
              <RateRow
                key={m.label}
                label={m.label}
                share={m.all}
                text={`passed by ${percent(m.all, 1)} of leaderboard repos${
                  m.language != null && language ? `, ${percent(m.language, 1)} of ${language} repos` : ""
                }`}
              />
            ))}
          </ul>
        </div>
      )}

      {rare.length > 0 && (
        <div className="mt-5">
          <SubHeading>Passes checks most repos miss</SubHeading>
          <ul className="m-0 list-none space-y-2.5 p-0 text-[14px]">
            {rare.map((r) => (
              <RateRow
                key={r.label}
                label={r.label}
                share={r.all}
                text={`only ${percent(r.all, 1)} of repos pass it`}
              />
            ))}
          </ul>
        </div>
      )}

      {lift && (
        <p className="m-0 mt-5 rounded-lg border border-tip/40 bg-surface-2 px-3.5 py-3 text-[14px] text-ink-dim">
          <span className="font-semibold text-tip">One fix for the most agents: </span>
          <span className="font-medium text-ink">{lift.label}</span> would raise the score for{" "}
          {lift.agents === MODELS.length ? `all ${MODELS.length}` : `${lift.agents} of ${MODELS.length}`} agents, by up
          to {lift.maxGain.toFixed(1)} points.
        </p>
      )}
    </Panel>
  );
}

import Link from "next/link";

import type { SignalResult } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { keySignals } from "@/lib/utils/repo-summary";

import { Panel, PanelHeading } from "./Panel";
import { ScoreBar } from "./ScoreBar";
import { ScoreNumber } from "./ScoreNumber";

type ModelScoreRow = { modelId: string; score: number };

const MARK = {
  ok: { cls: "tint-ok", ch: "✓", label: "Has" },
  partial: { cls: "tint-warn", ch: "~", label: "Partly has" },
  bad: { cls: "tint-bad", ch: "✗", label: "Missing" },
} as const;

function mark(pass: number) {
  return pass >= 1 ? MARK.ok : pass > 0 ? MARK.partial : MARK.bad;
}

type Props = {
  modelScores: ModelScoreRow[];
  signals: SignalResult[];
  /** The repo's place on each agent's board; absent for a repo that isn't on the boards. */
  ranks?: Record<string, { rank: number; total: number }>;
};

export function PerModelScores({ modelScores, signals, ranks }: Props) {
  return (
    <Panel>
      <PanelHeading>Score for each AI agent</PanelHeading>

      <p className="m-0 mb-1 text-[13.5px] text-muted">
        Each agent weighs the checks by its own docs. Under each score are its top three.{" "}
        <Link href="/methodology#agents" className="arrow-link">
          How each agent is scored →
        </Link>
      </p>

      <div className="divide-y divide-line">
        {[...MODELS]
          .map((m) => ({ model: m, score: modelScores.find((x) => x.modelId === m.id)?.score ?? null }))
          .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
          .map(({ model: m, score: s }) => (
            <div key={m.id} className="agent-row">
              <div className="text-[14.5px]">
                <Link href={modelPath(m.id)} aria-label={`${m.label} leaderboard`} className="font-medium ink-link">
                  {m.label}
                </Link>
                {ranks?.[m.id] && (
                  <div className="mt-0.5 text-[12px] text-muted">
                    #{ranks[m.id].rank} of {ranks[m.id].total}
                  </div>
                )}
              </div>

              {s === null ? (
                <div className="bar-place bar-track w-[180px]" aria-hidden />
              ) : (
                <ScoreBar score={s} width={180} className="bar-place" />
              )}

              {s === null ? (
                <span className="score-num text-[15px] text-muted">
                  <span aria-hidden="true">—</span>
                  <span className="sr-only">Not scored yet</span>
                </span>
              ) : (
                <ScoreNumber score={s} />
              )}

              <ul className="agent-checks">
                {keySignals(m, signals).map((sig) => {
                  const k = mark(sig.pass);

                  // role="img" makes the glyph presentational, so the label alone is read.
                  return (
                    <li key={sig.id}>
                      <span role="img" aria-label={k.label} className={`mark-sm ${k.cls}`}>
                        {k.ch}
                      </span>
                      {sig.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
      </div>
    </Panel>
  );
}

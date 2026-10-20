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
  ok: { cls: "bg-ok/15 text-ok", ch: "✓", label: "Has" },
  partial: { cls: "bg-warn/15 text-warn", ch: "~", label: "Partly has" },
  bad: { cls: "bg-bad/15 text-bad", ch: "✗", label: "Missing" },
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
        <Link href="/methodology#agents" className="text-ink-dim hover:text-ink-soft">
          How each agent is scored →
        </Link>
      </p>

      {[...MODELS]
        .map((m) => ({ model: m, score: modelScores.find((x) => x.modelId === m.id)?.score ?? null }))
        .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
        .map(({ model: m, score: s }) => (
          <div
            key={m.id}
            className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-b border-line py-3 last:border-b-0 sm:grid-cols-[150px_1fr_auto]"
          >
            <div className="text-[14.5px] font-medium">
              <Link
                href={modelPath(m.id)}
                aria-label={`${m.label} leaderboard`}
                className="text-ink hover:text-ink-soft"
              >
                {m.label}
              </Link>
              {ranks?.[m.id] && (
                <div className="mt-0.5 text-[12px] font-normal text-muted">
                  #{ranks[m.id].rank} of {ranks[m.id].total}
                </div>
              )}
            </div>

            <div className="order-3 col-span-2 sm:order-none sm:col-span-1">
              {s === null ? (
                <div className="h-[7px] w-[180px] rounded-sm bg-line" aria-hidden />
              ) : (
                <ScoreBar score={s} width={180} />
              )}
            </div>

            {s === null ? (
              <span className="text-[15px] font-semibold tabular-nums text-muted">
                <span aria-hidden="true">—</span>
                <span className="sr-only">Not scored yet</span>
              </span>
            ) : (
              <ScoreNumber score={s} />
            )}

            <ul className="order-4 col-span-2 m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-1.5 p-0 sm:col-start-2">
              {keySignals(m, signals).map((sig) => {
                const k = mark(sig.pass);

                return (
                  <li key={sig.id} className="inline-flex items-center gap-2 text-[14px] text-ink-dim">
                    <span
                      role="img"
                      aria-label={k.label}
                      className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-bold ${k.cls}`}
                    >
                      <span aria-hidden="true">{k.ch}</span>
                    </span>
                    {sig.label}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
    </Panel>
  );
}

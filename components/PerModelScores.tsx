import Link from "next/link";

import type { SignalResult } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
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

export function PerModelScores({ modelScores, signals }: { modelScores: ModelScoreRow[]; signals: SignalResult[] }) {
  return (
    <Panel>
      <PanelHeading>Score for each AI agent</PanelHeading>

      <p className="m-0 mb-1 text-[13.5px] text-muted">
        Each agent looks for different things in a repo, based on its own docs. Under each score are the three checks it
        cares about most.
      </p>

      {[...MODELS]
        .map((m) => ({ model: m, score: modelScores.find((x) => x.modelId === m.id)?.score ?? null }))
        .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
        .map(({ model: m, score: s }) => (
          <div
            key={m.id}
            className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-b border-line py-3 last:border-b-0 sm:grid-cols-[150px_1fr_auto]"
          >
            <div className="text-[14.5px] font-medium">{m.label}</div>

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
              <li className="sm:ml-auto">
                <Link
                  href={`/methodology#model-${m.id}`}
                  className="text-[13px] text-muted underline-offset-4 hover:text-ink-soft hover:underline"
                >
                  How {m.label} is scored →
                </Link>
              </li>
            </ul>
          </div>
        ))}
    </Panel>
  );
}

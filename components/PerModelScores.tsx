import { MODELS } from "@/lib/scoring/weights";

import { Panel, PanelHeading } from "./Panel";
import { ScoreBar } from "./ScoreBar";
import { ScoreNumber } from "./ScoreNumber";

type ModelScoreRow = { modelId: string; score: number };

export function PerModelScores({ modelScores }: { modelScores: ModelScoreRow[] }) {
  return (
    <Panel>
      <PanelHeading>Per-model scores</PanelHeading>

      <div className="grid grid-cols-1 gap-2.5">
        {[...MODELS]
          .map((m) => ({ model: m, score: modelScores.find((x) => x.modelId === m.id)?.score ?? 0 }))
          .sort((a, b) => b.score - a.score)
          .map(({ model: m, score: s }) => (
            <div
              key={m.id}
              className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line py-3 last:border-b-0 sm:grid-cols-[150px_1fr_auto] sm:gap-4"
            >
              <div className="text-[15px] font-medium">{m.label}</div>
              <div className="col-span-2 order-3 sm:col-span-1 sm:order-none">
                <ScoreBar score={s} width={100} />
                <div className="mt-1 text-sm text-muted">{m.rationale}</div>
              </div>

              <ScoreNumber score={s} />
            </div>
          ))}
      </div>
    </Panel>
  );
}

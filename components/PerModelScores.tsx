import type { SignalResult } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { keySignals } from "@/lib/utils/repo-summary";

import { type AgentScoreRow, PerModelScoresView } from "./PerModelScoresView";

type ModelScoreRow = { modelId: string; score: number };

type Props = {
  modelScores: ModelScoreRow[];
  signals: SignalResult[];
  /** The repo's place on each agent's board; absent for a repo that isn't on the boards. */
  ranks?: Record<string, { rank: number; total: number }>;
};

/** Rows are built here, where the scorer lives; the client view only lays them out. */
export function PerModelScores({ modelScores, signals, ranks }: Props) {
  const rows: AgentScoreRow[] = [...MODELS]
    .map((m) => ({ model: m, score: modelScores.find((x) => x.modelId === m.id)?.score ?? null }))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
    .map(({ model: m, score }) => ({
      id: m.id,
      score,
      ...(ranks?.[m.id] ? { rank: ranks[m.id] } : {}),
      checks: keySignals(m, signals).map((s) => ({ id: s.id, pass: s.pass })),
    }));

  return <PerModelScoresView rows={rows} />;
}

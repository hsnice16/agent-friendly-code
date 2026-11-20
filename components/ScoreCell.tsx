import { ScoreBar } from "./ScoreBar";
import { ScoreNumber } from "./ScoreNumber";

export function ScoreCell({ score }: { score: number | null }) {
  const n = score ?? 0;

  return (
    <div className="score-cell">
      <div className="wide-only">
        <ScoreBar score={n} />
      </div>

      <ScoreNumber score={n} />
    </div>
  );
}

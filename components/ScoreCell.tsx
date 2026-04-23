import { ScoreBar } from "./ScoreBar";
import { ScoreNumber } from "./ScoreNumber";

export function ScoreCell({ score }: { score: number | null }) {
  const n = score ?? 0;

  return (
    <div className="ml-auto flex items-center justify-end gap-3.5 sm:min-w-[180px]">
      <div className="hidden sm:block">
        <ScoreBar score={n} />
      </div>

      <ScoreNumber score={n} />
    </div>
  );
}

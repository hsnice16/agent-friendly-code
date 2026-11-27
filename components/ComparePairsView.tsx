"use client";

import { MODEL_LABEL } from "@/lib/model-labels";
import type { ModelId } from "@/lib/scoring/weights";

export type ComparePairRow = {
  a: ModelId;
  b: ModelId;
  avgA: number;
  avgB: number;
  aHigher: number;
  bHigher: number;
};

// Client: see AGENTS.md → Conventions.
export function ComparePairsView({ pairs }: { pairs: ComparePairRow[] }) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region
    <section className="table-wrap" tabIndex={0} aria-label="Agent comparisons">
      <table className="data-table min-w-[480px] text-[14px]">
        <caption className="sr-only">Average score of the board&apos;s repos for each agent in a pair</caption>
        <thead>
          <tr>
            <th scope="col">Comparison</th>
            <th scope="col" className="text-right">
              Averages
            </th>
            <th scope="col" className="text-right">
              Higher for each
            </th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((p) => (
            <tr key={`${p.a}-${p.b}`}>
              <th scope="row" className="font-medium">
                {MODEL_LABEL[p.a]} vs {MODEL_LABEL[p.b]}
              </th>
              <td className="text-right tabular-nums">
                {p.avgA.toFixed(1)} vs {p.avgB.toFixed(1)}
              </td>
              <td className="text-right tabular-nums">
                {p.aHigher} vs {p.bHigher}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

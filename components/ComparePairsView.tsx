"use client";

import { MODEL_LABEL } from "@/lib/model-labels";
import type { ModelId } from "@/lib/scoring/weights";
import { comparePath } from "@/lib/utils/compare-path";

import { IntentLink } from "./IntentLink";
import { LINK } from "./link-class";

export type ComparePairRow = {
  slug: string;
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
            <tr key={p.slug}>
              <th scope="row" className="font-medium">
                <IntentLink href={comparePath(p.slug)} className={`${LINK} cover-link`}>
                  {MODEL_LABEL[p.a]} vs {MODEL_LABEL[p.b]}
                </IntentLink>
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

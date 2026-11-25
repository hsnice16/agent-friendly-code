import type { PairStats, WeightGap } from "@/lib/agent-scores";
import type { ModelProfile } from "@/lib/scoring/weights";
import { checkPath } from "@/lib/utils/check-path";
import { hubAgentsPath } from "@/lib/utils/language";

import { IntentLink } from "./IntentLink";
import { LINK } from "./link-class";

type Pair = { a: ModelProfile; b: ModelProfile };

const pct = (share: number) => `${Math.round(share * 100)}%`;

export function WeightGapTable({ a, b, gaps }: Pair & { gaps: WeightGap[] }) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region
    <section className="table-wrap" tabIndex={0} aria-label="Checks each agent weighs">
      <table className="data-table text-[14px]">
        <caption className="sr-only">
          Share of each agent&apos;s score that a check carries, where {a.label} and {b.label} differ most
        </caption>
        <thead>
          <tr>
            <th scope="col">Check</th>
            <th scope="col" className="text-right">
              {a.label}
            </th>
            <th scope="col" className="text-right">
              {b.label}
            </th>
          </tr>
        </thead>
        <tbody>
          {gaps.map((g) => (
            <tr key={g.id}>
              <th scope="row" className="font-medium">
                <IntentLink href={checkPath(g.id)} className={`${LINK} cover-link`}>
                  {g.label}
                </IntentLink>
              </th>
              <td className="text-right tabular-nums">{pct(g.shareA)}</td>
              <td className="text-right tabular-nums">{pct(g.shareB)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

const LEAD = "font-semibold text-ink";

export function LanguageLeadTable({ a, b, languages }: Pair & { languages: PairStats["languages"] }) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region
    <section className="table-wrap" tabIndex={0} aria-label="Average score by language">
      <table className="data-table min-w-[420px] text-[14px]">
        <caption className="sr-only">
          Average {a.label} and {b.label} scores of the repos in each language; the higher is in bold
        </caption>
        <thead>
          <tr>
            <th scope="col">Language</th>
            <th scope="col" className="text-right">
              Repos
            </th>
            <th scope="col" className="text-right">
              {a.label}
            </th>
            <th scope="col" className="text-right">
              {b.label}
            </th>
          </tr>
        </thead>
        <tbody>
          {languages.map((l) => (
            <tr key={l.slug}>
              <th scope="row" className="font-medium">
                <IntentLink href={hubAgentsPath(l.slug)} className={`${LINK} cover-link`}>
                  {l.label}
                </IntentLink>
              </th>
              <td className="text-right tabular-nums">{l.n}</td>
              <td className={`text-right tabular-nums ${l.avgA >= l.avgB ? LEAD : ""}`}>{l.avgA.toFixed(1)}</td>
              <td className={`text-right tabular-nums ${l.avgB >= l.avgA ? LEAD : ""}`}>{l.avgB.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

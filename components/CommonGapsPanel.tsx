import type { SignalPassRate } from "@/lib/types/db";
import { checkPath } from "@/lib/utils/check-path";

import { IntentLink } from "./IntentLink";
import { Panel, PanelHeading } from "./Panel";

/** A language hub's or topic page's most-missed checks. */
export function CommonGapsPanel({ label, gaps }: { label: string; gaps: SignalPassRate[] }) {
  if (gaps.length === 0) return null;

  return (
    <div className="mb-3.5">
      <Panel>
        <PanelHeading>What {label} repos most often miss</PanelHeading>
        <ul className="link-list">
          {gaps.map((g) => (
            <li key={g.id} className="link-row">
              <IntentLink href={checkPath(g.id)} className="font-medium ink-link cover-link">
                {g.label}
              </IntentLink>
              : {Math.round(g.rate * 100)}% pass rate
            </li>
          ))}
        </ul>
        <p className="mt-3 mb-0 text-[13px] text-muted">
          Leaves out checks only one agent reads, which almost no repo passes. The{" "}
          <IntentLink href="/methodology" className="prose-link">
            methodology
          </IntentLink>{" "}
          explains each check.
        </p>
      </Panel>
    </div>
  );
}

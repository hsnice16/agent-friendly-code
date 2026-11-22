"use client";

import { SIGNAL_TEXT } from "@/lib/signal-text";
import { checkPath } from "@/lib/utils/check-slug";

import { IntentLink } from "./IntentLink";
import { Panel, PanelHeading } from "./Panel";
import { StarterLink, type StarterPage } from "./StarterLink";

type Variant = "strength" | "gap";

export type Props = {
  ids: string[];
  variant: Variant;
  empty: { chip: "ok" | "bad"; text: string };
  /** Set when the page shows a starter AGENTS.md: the missing row links to it. */
  starterOn?: StarterPage;
};

const VARIANTS = {
  strength: {
    glyph: "✓",
    ariaLabel: "Pass",
    heading: "What it has",
    chipClass: "tint-ok",
  },
  gap: {
    glyph: "✗",
    heading: "What it's missing",
    ariaLabel: "Missing",
    chipClass: "tint-bad",
  },
} as const;

export function SignalListCardView({ variant, ids, empty, starterOn }: Props) {
  const v = VARIANTS[variant];

  return (
    <Panel className="h-full">
      <PanelHeading>{v.heading}</PanelHeading>

      <ul className="m-0 list-none p-0 text-[14.5px]">
        {ids.length === 0 ? (
          <EmptyRow chip={empty.chip}>{empty.text}</EmptyRow>
        ) : (
          ids.map((id) => (
            <li key={id} className="flex items-center gap-3 link-row">
              <span role="img" aria-label={v.ariaLabel} className={`mark-md ${v.chipClass}`}>
                {v.glyph}
              </span>
              <IntentLink href={checkPath(id)} className="ink-link cover-link">
                {SIGNAL_TEXT[id].label}
              </IntentLink>
              {starterOn && id === "agents_md" && (
                <StarterLink
                  page={starterOn}
                  className="ml-auto shrink-0 text-[13px] font-medium text-tip hover:text-ink"
                >
                  Draft one ↓
                </StarterLink>
              )}
            </li>
          ))
        )}
      </ul>
    </Panel>
  );
}

function EmptyRow({ chip, children }: { chip: "ok" | "bad"; children: React.ReactNode }) {
  const v = VARIANTS[chip === "ok" ? "strength" : "gap"];

  return (
    <li className="flex items-center gap-3 py-2 text-muted">
      <span aria-hidden="true" className={`mark-md ${v.chipClass}`}>
        {v.glyph}
      </span>
      <span>{children}</span>
    </li>
  );
}

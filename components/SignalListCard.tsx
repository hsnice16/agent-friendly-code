import Link from "next/link";

import { checkPath } from "@/lib/utils/check-path";

import { Panel, PanelHeading } from "./Panel";

type Variant = "strength" | "gap";
type Item = { id: string; label: string };

type Props = {
  items: Item[];
  variant: Variant;
  empty: { chip: "ok" | "bad"; text: string };
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

export function SignalListCard({ variant, items, empty }: Props) {
  const v = VARIANTS[variant];

  return (
    <Panel className="h-full">
      <PanelHeading>{v.heading}</PanelHeading>

      <ul className="m-0 list-none divide-y divide-line p-0 text-[14.5px]">
        {items.length === 0 ? (
          <EmptyRow chip={empty.chip}>{empty.text}</EmptyRow>
        ) : (
          items.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-2">
              <span role="img" aria-label={v.ariaLabel} className={`mark-md ${v.chipClass}`}>
                {v.glyph}
              </span>
              <Link href={checkPath(s.id)} className="ink-link">
                {s.label}
              </Link>
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

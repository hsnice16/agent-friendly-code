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
    heading: "Strengths",
    chipClass: "bg-ok/15 text-ok",
  },
  gap: {
    glyph: "✗",
    heading: "Gaps",
    ariaLabel: "Missing",
    chipClass: "bg-bad/15 text-bad",
  },
} as const;

export function SignalListCard({ variant, items, empty }: Props) {
  const v = VARIANTS[variant];

  return (
    <Panel className="h-full">
      <PanelHeading>{v.heading}</PanelHeading>

      <ul className="m-0 list-none p-0">
        {items.length === 0 ? (
          <EmptyRow chip={empty.chip}>{empty.text}</EmptyRow>
        ) : (
          items.map((s) => (
            <li key={s.id} className="flex items-center gap-3 border-b border-line py-2 text-[14.5px] last:border-b-0">
              <span
                role="img"
                aria-label={v.ariaLabel}
                className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-xs font-bold ${v.chipClass}`}
              >
                <span aria-hidden="true">{v.glyph}</span>
              </span>
              <span>{s.label}</span>
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
    <li className="flex items-center gap-3 py-2 text-[14.5px] text-muted">
      <span
        aria-hidden="true"
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-xs font-bold ${v.chipClass}`}
      >
        {v.glyph}
      </span>
      <span>{children}</span>
    </li>
  );
}

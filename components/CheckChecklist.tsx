import Link from "next/link";

import { checkPath } from "@/lib/utils/check-path";
import { percent } from "@/lib/utils/format";

import { Panel, PanelHeading } from "./Panel";

type ChecklistRow = { id: string; label: string; full: number; total: number };

export function CheckChecklist({ rows }: { rows: ChecklistRow[] }) {
  return (
    <Panel>
      <PanelHeading>The {rows.length} checks, and how many leaderboard repos pass</PanelHeading>
      <ol className="m-0 grid list-none grid-cols-1 gap-x-8 p-0 text-[14px] sm:grid-cols-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-baseline justify-between gap-3 border-b border-line py-1.5">
            <Link href={checkPath(r.id)} className="text-ink hover:text-ink-soft">
              {r.label}
            </Link>
            <span className="shrink-0 tabular-nums text-ink-dim">{percent(r.full, r.total)}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 mb-0 text-[13px] text-muted">
        Pass rates count full passes only.{" "}
        <Link href="/check" className="text-ink-dim hover:text-ink-soft">
          The checklist
        </Link>{" "}
        says what each check looks for.
      </p>
    </Panel>
  );
}

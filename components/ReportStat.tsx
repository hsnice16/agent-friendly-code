import { percent } from "@/lib/utils/format";

import { keepFileCase, Panel } from "./Panel";

export function ReportStat({ label, value, note }: { label: string; value: string; note: React.ReactNode }) {
  return (
    <Panel className="h-full">
      <p className="eyebrow m-0 mb-2 text-[12.5px] text-muted">{keepFileCase(label)}</p>
      <p className="m-0 text-[28px] font-bold leading-none tracking-tight text-ink">{value}</p>
      <p className="mt-2 mb-0 text-[13px] leading-snug text-ink-dim">{note}</p>
    </Panel>
  );
}

export function ReportBar({ part, total }: { part: number; total: number }) {
  return (
    <div aria-hidden className="h-[7px] overflow-hidden rounded-sm bg-line">
      <div className="h-full rounded-sm bg-muted" style={{ width: percent(part, total) }} />
    </div>
  );
}

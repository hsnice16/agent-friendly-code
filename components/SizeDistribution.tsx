import type { Quantiles, SizeBucket } from "@/lib/agents-md-size";
import { percent } from "@/lib/utils/format";

import { ReportBar } from "./ReportStat";

const NUMBER = new Intl.NumberFormat("en-US");

const QUANTILE_LABELS: [keyof Quantiles, string][] = [
  ["p10", "10th percentile"],
  ["p25", "25th"],
  ["p50", "Median"],
  ["p75", "75th"],
  ["p90", "90th"],
];

export function SizeQuantiles({ quantiles }: { quantiles: Quantiles }) {
  return (
    <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-3 min-[420px]:grid-cols-3 md:grid-cols-5">
      {QUANTILE_LABELS.map(([key, label]) => (
        <div key={key}>
          <dt className="text-[12.5px] text-muted">{label}</dt>
          <dd className="stat-value tabular-nums">{NUMBER.format(quantiles[key])}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SizeBuckets({ buckets, total }: { buckets: SizeBucket[]; total: number }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[14.5px] text-ink-dim">
      {buckets.map((b) => (
        <li key={b.label} className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] items-center gap-x-4">
          <span className="min-w-0">
            <span className="text-ink">{b.label}</span>
            <span className="block tabular-nums text-[13px] text-muted">
              {b.count} ({percent(b.count, total)})
            </span>
          </span>
          <ReportBar part={b.count} total={total} />
        </li>
      ))}
    </ul>
  );
}

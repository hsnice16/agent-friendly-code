import type { TopicRow } from "@/lib/agents-md-contents-report";
import { percent } from "@/lib/utils/format";

import { ReportBar } from "./ReportStat";

const NUMBER = new Intl.NumberFormat("en-US");

export const SHARE_LIST = "m-0 flex list-none flex-col gap-2.5 p-0 text-[14.5px] text-ink-dim";

function Row({ label, note, part, of }: { label: React.ReactNode; note: React.ReactNode; part: number; of: number }) {
  return (
    <li className="grid grid-cols-1 items-center gap-x-4 gap-y-1.5 min-[480px]:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
      <span className="min-w-0">
        <span className="text-ink">{label}</span>
        <span className="block tabular-nums text-[13px] text-muted">{note}</span>
      </span>
      <ReportBar part={part} total={of} />
    </li>
  );
}

export function ContentsShare({ label, part, of }: { label: React.ReactNode; part: number; of: number }) {
  return <Row label={label} note={`${part} of ${of} (${percent(part, of)})`} part={part} of={of} />;
}

export function ContentsTopicList({ topics, total }: { topics: TopicRow[]; total: number }) {
  return (
    <ul className={SHARE_LIST}>
      {topics.map((t) => (
        <Row
          key={t.id}
          label={t.label}
          note={
            <>
              {t.files} of {total} ({percent(t.files, total)})
              {t.medianChars != null && <>, median {NUMBER.format(t.medianChars)} chars</>}
            </>
          }
          part={t.files}
          of={total}
        />
      ))}
    </ul>
  );
}

import { IntentLink } from "./IntentLink";

export type SizeGroupRow = { label: string; href?: string; count: number; value: string };

export function SizeGroupTable({
  rows,
  caption,
  groupHeading,
  valueHeading,
}: {
  rows: SizeGroupRow[];
  caption: string;
  groupHeading: string;
  valueHeading: string;
}) {
  return (
    <div className="table-wrap">
      <table className="data-table text-[14px] tabular-nums">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{groupHeading}</th>
            <th scope="col" className="text-right">
              Files
            </th>
            <th scope="col" className="text-right">
              {valueHeading}
            </th>
          </tr>
        </thead>
        <tbody className="text-ink-dim">
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row" className="font-normal text-ink">
                {r.href ? (
                  <IntentLink href={r.href} className="ink-link cover-link">
                    {r.label}
                  </IntentLink>
                ) : (
                  r.label
                )}
              </th>
              <td className="text-right">{r.count}</td>
              <td className="whitespace-nowrap text-right">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import type { ReactNode } from "react";

/** Every FAQ on the site: one look, a rule between questions. */
export function FaqList({ items }: { items: { key: string; q: ReactNode; a: ReactNode }[] }) {
  return (
    <dl className="m-0">
      {items.map((f) => (
        <div key={f.key} className="border-b border-line py-3.5 first:pt-0 last:border-b-0 last:pb-0">
          <dt className="m-0 text-[14.5px] font-semibold text-ink">{f.q}</dt>
          <dd className="m-0 mt-1.5 max-w-[76ch] text-[14px] leading-relaxed text-ink-dim">{f.a}</dd>
        </div>
      ))}
    </dl>
  );
}

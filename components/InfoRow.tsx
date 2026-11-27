import type { ReactNode } from "react";

/** One labelled fact in a `<dl>`. */
export function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="info-row">
      <dt className="text-[13px] font-medium text-muted">{label}</dt>
      <dd className="m-0 break-words text-[14.5px] text-ink-dim">{children}</dd>
    </div>
  );
}

import type { ReactNode } from "react";

import type { Crumb } from "./BreadcrumbJsonLd";
import { Breadcrumbs } from "./Breadcrumbs";

// For a second lead paragraph passed as children, or a lead the header can't place (the home board's sits below its card).
export const PAGE_LEAD = "mb-0 max-w-[72ch] text-[15.5px] text-ink-dim";

type Props = {
  title: ReactNode;
  lead?: ReactNode;
  crumbs?: { current: Crumb; parents?: Crumb[] };
  children?: ReactNode;
};

/** Every page's title block, so the h1 size and the gap to the first card are the same site-wide. */
export function PageHeader({ title, lead, crumbs, children }: Props) {
  return (
    <header className="mb-7">
      {crumbs && <Breadcrumbs current={crumbs.current} parents={crumbs.parents ?? []} />}
      <h1 className="m-0 text-[26px] font-bold leading-[1.2] tracking-tight sm:text-[30px] sm:leading-[1.18]">
        {title}
      </h1>
      {lead != null && <p className={`mt-2.5 ${PAGE_LEAD}`}>{lead}</p>}
      {children}
    </header>
  );
}

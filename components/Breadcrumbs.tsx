import { BreadcrumbJsonLd, breadcrumbTrail, type Crumb } from "./BreadcrumbJsonLd";
import { IntentLink } from "./IntentLink";

/** The visible trail and its BreadcrumbList, built from one list so they cannot disagree. */
export function Breadcrumbs({ current, parents }: { current: Crumb; parents: Crumb[] }) {
  const trail = breadcrumbTrail(current, parents);

  return (
    <>
      <BreadcrumbJsonLd current={current} parent={parents} />
      <nav aria-label="Breadcrumb" className="mb-3 text-[13px] text-muted">
        <ol className="m-0 flex list-none flex-wrap items-center gap-x-1.5 gap-y-1 p-0">
          {trail.map((c, i) => (
            <li key={c.path} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i === trail.length - 1 ? (
                <span aria-current="page" className="break-words text-ink-dim">
                  {c.name}
                </span>
              ) : (
                <IntentLink href={c.path} className="tap-target text-muted hover:text-ink">
                  {c.name}
                </IntentLink>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

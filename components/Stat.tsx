import { IntentLink } from "./IntentLink";

/** With `href` the whole tile is the link; a `#hash` stays a plain anchor so `HashDetails` can catch it. */
export function Stat({
  label,
  value,
  note,
  href,
}: {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  href?: string;
}) {
  // The link's own text is only the value ("#12 of 300"); a link list read out of context needs the label too.
  const named = (
    <>
      <span className="sr-only">{label}: </span>
      {value}
    </>
  );

  return (
    <div className={href ? "tile relative" : "tile"}>
      <dt className="text-[12.5px] eyebrow text-muted">{label}</dt>
      <dd className="stat-value">
        {!href ? (
          value
        ) : href.startsWith("#") ? (
          <a href={href} className="cover-link">
            {named}
          </a>
        ) : (
          <IntentLink href={href} className="cover-link">
            {named}
          </IntentLink>
        )}
      </dd>
      {note && <dd className="m-0 mt-1 text-[13px] text-muted">{note}</dd>}
    </div>
  );
}

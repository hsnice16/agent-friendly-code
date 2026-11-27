// Each page's "Last updated" line and its sitemap lastmod read these, so the two can't drift.
export const PRIVACY_UPDATED = "2026-11-27";
export const TERMS_UPDATED = "2026-10-10";

const LONG = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/** "October 28, 2026", the form legal pages conventionally use. */
export function legalDate(iso: string): string {
  return LONG.format(new Date(iso));
}

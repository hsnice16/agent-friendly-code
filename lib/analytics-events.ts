// The site's own events, one name each, so GA reports stay countable.
export type AnalyticsEvent =
  | { name: "live_score_submit"; host: string }
  | { name: "share_score"; network: ShareNetwork }
  | { name: "badge_copy"; page: "repo" | "live_score" };

export type ShareNetwork = "x" | "linkedin" | "bluesky" | "copy_link";

/** No-op until gtag has loaded; it queues behind consent like page views do. */
export function track({ name, ...params }: AnalyticsEvent): void {
  const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
  try {
    gtag?.("event", name, params);
  } catch {
    // Analytics must never break the click that triggered it.
  }
}

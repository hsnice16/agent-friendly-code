import type { ScoreTier } from "./utils/score";

// The site's own events, one name each, so GA reports stay countable.
export type AnalyticsEvent =
  | { name: "live_score_submit"; host: string }
  | { name: "live_score_result"; outcome: LiveScoreOutcome; tier?: ScoreTier }
  | { name: "share_score"; network: ShareNetwork }
  | { name: "badge_copy"; page: "repo" | "live_score" }
  | { name: "copy_install"; tool: "skill" | "skill_hook" | "action" }
  | { name: "package_lookup"; registry: string }
  | { name: "select_agent"; agent: string }
  // GA4's recommended name: its built-in "Search term" dimension reads `search_term`.
  | { name: "search"; search_term: string; results: number; board: string }
  | { name: "leaderboard_filter"; filter: "host" | "sort"; option: string }
  | { name: "score_nudge_click" };

export type ShareNetwork = "x" | "linkedin" | "bluesky" | "copy_link";
export type LiveScoreOutcome = "scored" | "not_found" | "too_large" | "unsupported" | "error";

/** No-op until gtag has loaded; it queues behind consent like page views do. */
export function track({ name, ...params }: AnalyticsEvent): void {
  const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
  try {
    gtag?.("event", name, params);
  } catch {
    // Analytics must never break the click that triggered it.
  }
}

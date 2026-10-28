"use client";

import { useEffect, useRef } from "react";

import { type AnalyticsEvent, track } from "@/lib/analytics-events";

/** Sends one event when a server-rendered outcome reaches the browser. Renders nothing. */
export function TrackEvent({ event, dedupeKey }: { event: AnalyticsEvent; dedupeKey?: string }) {
  // The ref survives Strict Mode's remount and re-renders, so a page view is
  // one event; a new key (the event itself by default) still sends.
  const sent = useRef<string | null>(null);
  const key = dedupeKey ?? JSON.stringify(event);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` stands in for `event`
  useEffect(() => {
    if (sent.current === key) return;
    sent.current = key;
    track(event);
  }, [key]);
  return null;
}

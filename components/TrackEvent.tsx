"use client";

import { useEffect, useRef } from "react";

import { type AnalyticsEvent, track } from "@/lib/analytics-events";

/** Sends one event when a server-rendered outcome reaches the browser. Renders nothing. */
export function TrackEvent({ event }: { event: AnalyticsEvent }) {
  // The ref survives Strict Mode's remount and re-renders, so a page view is
  // one event; a new outcome (different content) still sends.
  const sent = useRef<string | null>(null);
  const key = JSON.stringify(event);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` stands in for `event`
  useEffect(() => {
    if (sent.current === key) return;
    sent.current = key;
    track(event);
  }, [key]);
  return null;
}

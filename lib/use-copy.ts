"use client";

import { useEffect, useRef, useState } from "react";

import { type AnalyticsEvent, track } from "./analytics-events";

const RESET_MS = 1500;

/**
 * `failed` stays set until the next try: some in-app browsers and plain-http
 * hosts have no clipboard, so the caller shows the text to copy by hand.
 */
export function useCopy(text: string, event?: AnalyticsEvent) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      if (event) track(event);
      setFailed(false);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), RESET_MS);
    } catch {
      setCopied(false);
      setFailed(true);
    }
  }

  return { copied, failed, copy };
}

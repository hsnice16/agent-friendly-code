"use client";

import { useEffect, useState } from "react";

import { inConsentRegion, OPEN_CONSENT_EVENT } from "@/lib/analytics-consent";

// Shown only where the banner asks, decided after mount like the banner: the
// page is prerendered and the time zone is unreadable on the server.
export function ConsentSettingsButton({ className }: { className?: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    setShown(inConsentRegion());
  }, []);

  if (!shown) return null;

  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))} className={className}>
      Change your analytics choice
    </button>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { type ConsentChoice, inConsentRegion, readConsent, storeConsent } from "@/lib/analytics-consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function ConsentBanner() {
  // Decided after mount: storage and time zone are unreadable on the server,
  // and the page is prerendered for every visitor.
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (readConsent() === null && inConsentRegion()) setIsOpen(true);
  }, []);

  if (!isOpen) return null;

  const choose = (choice: ConsentChoice) => {
    storeConsent(choice);
    window.gtag?.("consent", "update", { analytics_storage: choice });
    setIsOpen(false);
  };

  return (
    <section
      aria-label="Analytics cookies"
      className="animate-pop-in fixed inset-x-3 bottom-3 z-40 rounded-card border border-line bg-surface p-3.5 shadow-lg sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[340px]"
    >
      <p className="m-0 text-[13.5px] leading-snug text-ink-dim">
        May we use Google Analytics cookies to count visits? Nothing else is tracked.{" "}
        <Link href="/privacy" className="text-ink-dim underline decoration-dotted hover:text-ink">
          Privacy
        </Link>
      </p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => choose("granted")}
          className="flex-1 cursor-pointer rounded-md border border-line px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-surface-hover"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => choose("denied")}
          className="flex-1 cursor-pointer rounded-md border border-line px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-surface-hover"
        >
          Decline
        </button>
      </div>
    </section>
  );
}

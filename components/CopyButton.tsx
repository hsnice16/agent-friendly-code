"use client";

import { useEffect, useRef } from "react";

import type { AnalyticsEvent } from "@/lib/analytics-events";
import { useCopy } from "@/lib/use-copy";

/** CopySnippet without the snippet on show, for text the reader needs to paste rather than read. */
export function CopyButton({
  text,
  event,
  children,
  className,
}: {
  text: string;
  /** Sent on a successful copy. */
  event?: AnalyticsEvent;
  children: React.ReactNode;
  className: string;
}) {
  const { copied, failed, copy } = useCopy(text, event);
  const fallback = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (failed) fallback.current?.select();
  }, [failed]);

  return (
    <>
      <button type="button" onClick={copy} aria-live="polite" className={className}>
        {copied ? "Copied" : children}
      </button>
      {failed && (
        <input
          ref={fallback}
          readOnly
          value={text}
          aria-label="Copy this text"
          onFocus={(e) => e.currentTarget.select()}
          className="field w-full"
        />
      )}
    </>
  );
}

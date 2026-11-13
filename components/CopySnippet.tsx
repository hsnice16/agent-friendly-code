"use client";

import { Check, Copy } from "@phosphor-icons/react";
import type { AnalyticsEvent } from "@/lib/analytics-events";
import { useCopy } from "@/lib/use-copy";

export type SnippetTone = false | "info" | "tip";

const PRE_TONE: Record<Exclude<SnippetTone, false>, string> = {
  tip: "border-tip/40 text-tip",
  info: "border-info/40 text-info",
};

const BTN_TONE: Record<Exclude<SnippetTone, false>, string> = {
  tip: "border-tip/40 text-tip hover:border-tip",
  info: "border-info/40 text-info hover:border-info",
};

export function CopySnippet({
  text,
  highlight = false,
  event,
  wrap = false,
  label = "Code snippet",
}: {
  text: string;
  highlight?: SnippetTone;
  /** Sent on a successful copy. */
  event?: AnalyticsEvent;
  /** Wrap long lines: for prose, where scrolling sideways hides the sentence. */
  wrap?: boolean;
  /** Names the scroll region a multi-line snippet becomes. */
  label?: string;
}) {
  const { copied, copy } = useCopy(text, event);
  const isMultiLine = text.includes("\n");
  const scrolls = isMultiLine && !wrap;

  return (
    <div className="relative">
      <pre
        // A one-line command wraps instead of scrolling, so none of it hides under the copy button on a phone.
        className={`m-0 overflow-x-auto rounded-md border bg-surface-2 px-3 py-2 pr-11 text-[12px] leading-relaxed ${
          wrap ? "whitespace-pre-wrap break-words" : isMultiLine ? "" : "whitespace-pre-wrap break-all"
        } ${highlight ? PRE_TONE[highlight] : "border-line"}`}
        // A keyboard user can only scroll a region that takes focus.
        {...(scrolls ? { tabIndex: 0, role: "region", "aria-label": label } : {})}
      >
        <code>{text}</code>
      </pre>

      <button
        type="button"
        onClick={copy}
        aria-live="polite"
        aria-label={copied ? "Copied to clipboard" : "Copy snippet to clipboard"}
        // The after: inset grows the hit area to 44px without growing the button.
        className={`absolute right-1.5 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border bg-surface after:absolute after:-inset-2 ${
          isMultiLine ? "top-1.5" : "top-1/2 -translate-y-1/2"
        } ${highlight ? BTN_TONE[highlight] : "border-line text-muted hover:text-ink"}`}
      >
        <span
          aria-hidden="true"
          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out ${
            copied ? "opacity-0 scale-0" : "opacity-100 scale-100"
          }`}
        >
          <Copy size={14} />
        </span>

        <span
          aria-hidden="true"
          className={`absolute inset-0 flex items-center justify-center text-ok transition-all duration-200 ease-out ${
            copied ? "opacity-100 scale-100" : "opacity-0 scale-0"
          }`}
        >
          <Check size={14} weight="bold" />
        </span>
      </button>
    </div>
  );
}

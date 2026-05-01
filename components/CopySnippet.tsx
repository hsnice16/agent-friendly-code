"use client";

import { Check, Copy } from "@phosphor-icons/react";
import { useState } from "react";

const RESET_MS = 1500;

export type SnippetTone = false | "warn" | "info" | "tip";

const PRE_TONE: Record<Exclude<SnippetTone, false>, string> = {
  tip: "border-tip/40 text-tip",
  info: "border-info/40 text-info",
  warn: "border-warn/40 text-warn",
};

const BTN_TONE: Record<Exclude<SnippetTone, false>, string> = {
  tip: "border-tip/40 text-tip hover:border-tip",
  info: "border-info/40 text-info hover:border-info",
  warn: "border-warn/40 text-warn hover:border-warn",
};

export function CopySnippet({ text, highlight = false }: { text: string; highlight?: SnippetTone }) {
  const [copied, setCopied] = useState(false);
  const isMultiLine = text.includes("\n");

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);
      setTimeout(() => setCopied(false), RESET_MS);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="relative">
      <pre
        className={`m-0 overflow-x-auto rounded-md border bg-surface-2 px-3 py-2 pr-11 text-[12px] leading-relaxed ${
          highlight ? PRE_TONE[highlight] : "border-line"
        }`}
      >
        <code>{text}</code>
      </pre>

      <button
        type="button"
        onClick={onCopy}
        aria-live="polite"
        aria-label={copied ? "Copied to clipboard" : "Copy snippet to clipboard"}
        className={`absolute right-1.5 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border bg-surface ${
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

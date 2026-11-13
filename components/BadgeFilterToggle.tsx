"use client";

import { CheckCircle } from "@phosphor-icons/react";

export function BadgeFilterToggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={value}
      title="Only repos that show the Agent Friendly Code badge in their README"
      onClick={() => onChange(!value)}
      aria-label="Only repos showing the badge"
      className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 text-[13px] ${
        value ? "border-ok/40 bg-ok/10 text-ok" : "border-line bg-surface text-ink-dim hover:text-ink-soft"
      }`}
    >
      <CheckCircle size={13} weight={value ? "fill" : "regular"} aria-hidden="true" />
      Badge
    </button>
  );
}

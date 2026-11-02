"use client";

import { CircleNotch, MagnifyingGlass } from "@phosphor-icons/react";

import { MAX_SEARCH_LENGTH } from "@/lib/constants/scoring";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Results for what's typed are still loading. */
  busy?: boolean;
  placeholder?: string;
};

export function SearchBar({ value, onChange, busy = false, placeholder = "Search repos by owner/name" }: Props) {
  const Icon = busy ? CircleNotch : MagnifyingGlass;

  return (
    <search className="relative min-w-0 flex-1">
      <label htmlFor="repo-search" className="sr-only">
        {placeholder}
      </label>

      <Icon
        size={14}
        weight="bold"
        aria-hidden="true"
        className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted ${busy ? "animate-spin" : ""}`}
      />

      <input
        type="search"
        aria-busy={busy}
        value={value}
        id="repo-search"
        autoComplete="off"
        spellCheck={false}
        maxLength={MAX_SEARCH_LENGTH}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border border-line bg-surface py-1.5 pl-8 pr-3 text-[13px] text-ink placeholder:text-muted outline-none focus:border-ink-dim"
      />
    </search>
  );
}

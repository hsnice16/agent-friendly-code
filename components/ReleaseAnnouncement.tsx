"use client";

import { X } from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { hasSeenRelease, markReleaseSeen } from "@/lib/release-notice";

type Props = {
  version: string;
  /** Newest changelog headline — the whole point of the notice. */
  title: string;
};

// Render it directly above the section the release is about. `sticky bottom`
// pins it to the foot of the viewport while that spot is below the fold and
// lets it settle there once scrolled to, so the pointer always means "this,
// here" with no measuring and nothing to redo on resize.
export function ReleaseAnnouncement({ version, title }: Props) {
  // Never set during the server render — localStorage is unreadable there, and
  // deciding at render time would hydrate a mismatch.
  const [isOpen, setIsOpen] = useState(false);

  const dismiss = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (hasSeenRelease(version)) return;

    // Marked on show, not on hide: a visitor who leaves after two seconds has
    // still had their one announcement, and a reload should not repeat it.
    markReleaseSeen(version);
    setIsOpen(true);
  }, [version]);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, dismiss]);

  if (!isOpen) return null;

  return (
    <aside
      // Not a dialog: it steals no focus and blocks nothing, so it must not
      // announce itself as one. `status` reads it out without interrupting.
      role="status"
      aria-live="polite"
      aria-label="What's new"
      className="animate-pop-in sticky bottom-4 z-30 -mb-3 mt-6 w-[280px] max-w-full rounded-card border border-line bg-surface p-3.5 shadow-lg"
    >
      <span
        aria-hidden="true"
        className="absolute -bottom-[5px] left-6 h-2 w-2 rotate-45 border-b border-r border-line bg-surface"
      />

      <div className="flex items-start justify-between gap-3">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-warn">New in v{version}</p>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss what's new"
          className="-mr-1 -mt-1 inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-surface-hover hover:text-ink"
        >
          <X size={13} weight="bold" aria-hidden="true" />
        </button>
      </div>

      <p className="m-0 mt-1.5 text-[14.5px] font-semibold leading-snug tracking-tight text-ink">{title}</p>

      <Link href="/changelog" onClick={dismiss} className="mt-2.5 inline-block text-[13px] text-ink-dim hover:text-ink">
        See what shipped →
      </Link>
    </aside>
  );
}

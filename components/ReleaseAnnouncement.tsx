"use client";

import { X } from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { hasSeenRelease, markReleaseSeen } from "@/lib/release-notice";

const AUTO_HIDE_MS = 12_000;

/** Fixed, so the pointer maths has one known number rather than a measured one. */
const WIDTH = 280;
const GAP = 10;
const EDGE = 12;

type Anchor = { left: number; top: number; pointer: number };

type Props = {
  version: string;
  /** Newest changelog headline — the whole point of the notice. */
  title: string;
  /** Nav link to sit under. The release is about that page, so that is what the pointer should mean. */
  anchorHref: string;
};

// Measured, not offset from the container edge: the nav's own contents decide
// where the link lands, and they change.
//
// Null means "don't show at all" — below `md` the header collapses to a
// hamburger, the nav is display:none, and there is nothing to point at.
function anchorTo(href: string): Anchor | null {
  const link = document.querySelector<HTMLElement>(`header a[href="${href}"]`);
  if (!link) return null;

  const rect = link.getBoundingClientRect();
  if (rect.width === 0) return null;

  const center = rect.left + rect.width / 2;
  const rightMost = Math.max(window.innerWidth - WIDTH - EDGE, EDGE);
  const left = Math.min(Math.max(center - WIDTH / 2, EDGE), rightMost);

  return { left, top: rect.bottom + GAP, pointer: center - left };
}

export function ReleaseAnnouncement({ version, title, anchorHref }: Props) {
  // One state, not an `open` flag beside it: anchored *is* open, so the
  // "showing but unpositioned" combination cannot be represented. Never set
  // during the server render — localStorage is unreadable there, and deciding
  // at render time would hydrate a mismatch.
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const isOpen = anchor !== null;

  const dismiss = useCallback(() => setAnchor(null), []);

  useEffect(() => {
    if (hasSeenRelease(version)) return;

    // Measured before anything else: on a hamburger-width screen there is no
    // anchor, so nothing is shown — and nothing is marked seen either, or the
    // one announcement would be spent on a screen that never displayed it.
    const at = anchorTo(anchorHref);
    if (!at) return;

    // Marked on show, not on hide: a visitor who leaves after two seconds has
    // still had their one announcement, and a reload should not repeat it.
    markReleaseSeen(version);
    setAnchor(at);

    const timer = setTimeout(() => setAnchor(null), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [version, anchorHref]);

  useEffect(() => {
    if (!isOpen) return;

    // The header is `sticky top-0`, so the link never moves on scroll — only a
    // resize can invalidate the measurement. Narrowing into the hamburger
    // breakpoint returns null, which closes it.
    const measure = () => setAnchor(anchorTo(anchorHref));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };

    window.addEventListener("resize", measure);
    document.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("resize", measure);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, dismiss, anchorHref]);

  if (!anchor) return null;

  return (
    <aside
      // Not a dialog: it steals no focus and blocks nothing, so it must not
      // announce itself as one. `status` reads it out without interrupting.
      role="status"
      aria-live="polite"
      aria-label="What's new"
      style={{ left: anchor.left, top: anchor.top, width: WIDTH }}
      className="animate-pop-in fixed z-30 rounded-card border border-line bg-surface p-3.5 shadow-lg"
    >
      <span
        aria-hidden="true"
        style={{ left: anchor.pointer }}
        className="absolute -top-[5px] -ml-1 h-2 w-2 rotate-45 border-l border-t border-line bg-surface"
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

"use client";

import { List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { VersionPill } from "./VersionPill";

type NavLink = { href: string; label: string };

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) firstLinkRef.current?.focus();
  }, [open]);

  return (
    <div ref={wrapRef} className="relative md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface-2 text-ink-dim hover:bg-surface-hover hover:text-ink"
      >
        {open ? <X size={16} weight="bold" /> : <List size={16} weight="bold" />}
      </button>

      {open && (
        <div
          role="menu"
          id="mobile-nav-menu"
          className="absolute right-0 top-full z-30 mt-2 min-w-[180px] overflow-hidden rounded-lg border border-line bg-surface shadow-lg"
        >
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              ref={i === 0 ? firstLinkRef : undefined}
              className="block px-3.5 py-2 text-[13px] text-ink-dim hover:bg-surface-hover hover:text-ink"
            >
              {l.label}
            </Link>
          ))}

          <div aria-hidden="true" className="border-t border-line" />
          <div className="flex items-center justify-between px-3.5 py-2 text-[11.5px] text-muted">
            <span>Build</span>
            <VersionPill />
          </div>
        </div>
      )}
    </div>
  );
}

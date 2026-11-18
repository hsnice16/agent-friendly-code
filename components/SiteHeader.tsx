"use client";

import Link from "next/link";

import { APP_NAME } from "@/lib/version";

import { MobileNav } from "./MobileNav";
import { VersionPill } from "./VersionPill";

// Alphabetical by label — a new entry has exactly one place to go.
const NAV_LINKS = [
  { href: "/skill", label: "Agent Skill" },
  { href: "/action", label: "GitHub Action" },
  { href: "/score", label: "Live Score" },
  { href: "/methodology", label: "Methodology" },
];

// A client component, so the RSC payload on every page carries a reference, not the header's markup.
export function SiteHeader() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-30 rounded-md bg-surface px-3 py-2 text-[14px] text-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-b border-line/80 bg-bg/60 backdrop-blur-md backdrop-saturate-150">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-3 px-3 py-3 sm:px-6">
          <Link
            href="/"
            className="tap-target flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-ink hover:opacity-80"
          >
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-[13px] font-bold text-accent-ink"
            >
              A
            </span>
            {APP_NAME}
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-4 text-[13.5px] md:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="dim-link">
                {l.label}
              </Link>
            ))}
            <VersionPill />
          </nav>

          <MobileNav links={NAV_LINKS} />
        </div>
      </header>
    </>
  );
}

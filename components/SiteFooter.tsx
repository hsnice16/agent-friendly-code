"use client";

import Link from "next/link";

import type { DirectoryRow } from "@/lib/footer-directory";
import { REPO_URL } from "@/lib/version";

import { PeerlistBadge } from "./PeerlistBadge";
import { ProductHuntBadge } from "./ProductHuntBadge";
import { SkillsShBadge } from "./SkillsShBadge";

// Client for payload size (AGENTS.md → Conventions). The rows are built on the server
// (`footerDirectoryRows`), where the signal registry lives; the year is the build's.

type Item = { label: string; href: string };

const FOOTER_LINKS_TOOLS = [
  { href: "/skill", label: "Agent Skill" },
  { href: "/action", label: "GitHub Action" },
  { href: "/score", label: "Live Score" },
  { href: "/package", label: "Packages" },
];

const FOOTER_LINKS_LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

// On the row, not each link: one class string instead of one per link.
const FOOTER_LINKS_CLASS = "[&_a]:prose-link";

// No prefetch: the footer is on every page, and each prefetched link is a billed ISR read.
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} prefetch={false} className="tap-target">
      {children}
    </Link>
  );
}

function FooterDirectoryView({ rows }: { rows: DirectoryRow[] }) {
  return (
    // tap-target from the nav, not on each of the ~60 links: every class string ships in every page's HTML.
    <nav
      aria-label="Directory"
      className="mb-8 flex flex-col gap-4 border-b border-line pb-8 [&_a]:tap-target [&_a]:hover:text-ink-soft"
    >
      {rows.map((r) => (
        <div key={r.label} className="dir-row">
          <span className="font-semibold text-ink-dim">{r.label}</span>
          <ul className="dir-list">
            {[...r.items, r.all].map((i) => (
              <li key={i.href}>
                <Link href={i.href} prefetch={false}>
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function SiteFooter({ directory, primary, year }: { directory: DirectoryRow[]; primary: Item[]; year: number }) {
  return (
    <footer className="mt-12 border-t border-line pt-8 text-[13px] leading-[1.7] text-muted">
      <FooterDirectoryView rows={directory} />

      <p className="m-0">
        Scores come from checking files in each repo. No agent is actually run. What each agent looks for comes from its
        own docs, but how much each check counts is still our best guess, not yet tested.
      </p>

      <SkillsShBadge className="mt-5" />

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <PeerlistBadge />
        <ProductHuntBadge />
      </div>

      <div
        className={`mt-12 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8 ${FOOTER_LINKS_CLASS}`}
      >
        {/* Each separator trails its item, so a wrapped line never starts with one. */}
        <p className="m-0 order-2 flex flex-wrap items-center gap-x-1.5 gap-y-[24px] text-[12px] sm:order-1 sm:gap-y-1">
          <span>
            © {year}{" "}
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/hsnice16" className="tap-target">
              Himanshu Singh
            </a>
            <span aria-hidden="true"> ·</span>
          </span>

          {/* No noreferrer: tula is the author's own site, and its analytics should see this referral. */}
          <span>
            also made{" "}
            <a target="_blank" rel="noopener" href="https://usetu.la/" className="tap-target">
              tula — crypto liquidation risk CLI
            </a>
            <span aria-hidden="true"> ·</span>
          </span>

          <span>
            <a target="_blank" rel="noopener noreferrer" href={`${REPO_URL}/blob/main/LICENSE`} className="tap-target">
              MIT
            </a>
            <span aria-hidden="true"> ·</span>
          </span>

          {FOOTER_LINKS_LEGAL.map((l, i) => (
            <span key={l.href}>
              <FooterLink href={l.href}>{l.label}</FooterLink>
              {i < FOOTER_LINKS_LEGAL.length - 1 && <span aria-hidden="true"> ·</span>}
            </span>
          ))}
        </p>

        <nav aria-label="Secondary" className="order-1 grid grid-cols-2 gap-x-12 sm:order-2 sm:gap-x-16">
          <div className="flex flex-col items-start gap-[22px] sm:gap-1">
            {primary.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </div>

          <div className="flex flex-col items-start gap-[22px] sm:gap-1">
            {FOOTER_LINKS_TOOLS.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </div>
        </nav>
      </div>
    </footer>
  );
}

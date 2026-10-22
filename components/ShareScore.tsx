"use client";

import { Check, LinkSimple, ShareNetwork } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";

import { type ShareNetwork as Network, track } from "@/lib/analytics-events";

import { BlueskyBrandLogo, LinkedInBrandLogo, XBrandLogo } from "./BrandLogos";

const RESET_MS = 1500;

const ITEM =
  "flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-left text-[14px] text-ink no-underline hover:bg-surface-hover hover:no-underline focus-visible:bg-surface-hover";
const TILE = "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-bg";

type Props = {
  slug: string;
  score: number;
  url: string;
  /** Which edge of the button the menu lines up with; it always opens upward, off a viewport-bottom button. */
  align: "start" | "end";
};

const MENU_POSITION = {
  start: "left-0 origin-bottom-left",
  end: "right-0 origin-bottom-right",
};

export function ShareScore({ slug, score, url, align }: Props) {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const text = `${slug} scores ${score.toFixed(1)}/100 for AI coding agents.`;

  const networks: { id: Exclude<Network, "copy_link">; label: string; href: string; logo: React.ReactNode }[] = [
    {
      id: "x",
      label: "X",
      href: `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      logo: <XBrandLogo className="text-ink" />,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      logo: <LinkedInBrandLogo className="text-linkedin" />,
    },
    {
      id: "bluesky",
      label: "Bluesky",
      href: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${text} ${url}`)}`,
      logo: <BlueskyBrandLogo className="text-bluesky" />,
    },
  ];

  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      track({ name: "share_score", network: "copy_link" });
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, RESET_MS);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Share this score"
        title="Share this score"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-ink shadow-sm hover:bg-surface-hover"
      >
        <ShareNetwork size={18} weight="bold" aria-hidden="true" />
      </button>

      <div
        id={menuId}
        inert={!open}
        className={`absolute bottom-full z-30 mb-2 w-[200px] ${MENU_POSITION[align]} rounded-xl border border-line bg-surface p-1.5 shadow-lg transition duration-150 ease-out ${
          open ? "scale-100 opacity-100 pointer-events-auto" : "scale-0 opacity-0 pointer-events-none"
        }`}
      >
        {networks.map((n) => (
          <a
            key={n.id}
            href={n.href}
            target="_blank"
            rel="noopener noreferrer"
            className={ITEM}
            aria-label={`Share on ${n.label} (new tab)`}
            onClick={() => {
              track({ name: "share_score", network: n.id });
              setOpen(false);
            }}
          >
            <span className={TILE}>{n.logo}</span>
            {n.label}
          </a>
        ))}
        <button type="button" onClick={copyLink} className={ITEM}>
          <span className={TILE}>
            {copied ? (
              <Check size={16} weight="bold" aria-hidden="true" className="text-ok" />
            ) : (
              <LinkSimple size={16} weight="bold" aria-hidden="true" />
            )}
          </span>
          <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
        </button>
      </div>
    </div>
  );
}

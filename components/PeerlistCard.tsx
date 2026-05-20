"use client";

import { ArrowUpRight } from "@phosphor-icons/react";

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

export function PeerlistCard() {
  const handleClick = () => {
    window.gtag?.("event", "outbound_click", { destination: "peerlist" });
  };

  return (
    <a
      target="_blank"
      onClick={handleClick}
      rel="noopener noreferrer"
      href="https://peerlist.io/hsnice16/project/agent-friendly-code"
      aria-label="Live on Peerlist Launchpad — open the Agent Friendly Code project page (new tab)"
      className="group relative block w-full max-w-[340px] shrink-0 self-start overflow-hidden rounded-lg border border-line transition-colors hover:border-line-strong sm:w-[300px]"
    >
      <picture>
        <source media="(prefers-color-scheme: dark)" srcSet="/launch/peerlist-dark.png" />
        <img
          height={630}
          width={1200}
          className="block h-auto w-full"
          alt="Live on Peerlist Launchpad"
          src="/launch/peerlist-light.png"
        />
      </picture>

      <span
        aria-hidden="true"
        className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-bg/85 text-ink-dim ring-1 ring-line backdrop-blur-sm transition-colors group-hover:bg-bg group-hover:text-ink"
      >
        <ArrowUpRight size={13} weight="bold" />
      </span>
    </a>
  );
}

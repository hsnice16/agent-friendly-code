"use client";

import { useEffect, useRef, useState } from "react";

import { Panel, PanelHeading } from "./Panel";

/** Shown on request: the workflow file is the same on every repo page, so it stays out of the visible HTML (it is still in the RSC payload). */
export function ActionEmbedReveal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const revealed = useRef<HTMLElement>(null);

  // The button that had focus is gone once the file shows.
  useEffect(() => {
    if (open) revealed.current?.focus();
  }, [open]);

  if (open) {
    return (
      <section
        ref={revealed}
        tabIndex={-1}
        aria-label="Pull request workflow file"
        className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
      >
        {children}
      </section>
    );
  }

  return (
    <Panel tone="info">
      <PanelHeading tone="info">Check the score on every pull request</PanelHeading>
      <p className="m-0 mb-3 text-[13px] text-muted">
        A GitHub Action posts one comment per pull request with how the score changed and why.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-md border border-info/40 px-3 py-1.5 text-[13px] font-medium text-info hover:border-info"
      >
        Show the workflow file
      </button>
    </Panel>
  );
}

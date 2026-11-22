"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics-events";
import { STARTER_ID } from "@/lib/utils/generator-path";

export type StarterPage = "repo" | "score";

/** Opens the starter and moves focus into it, as following the fragment would have. */
function openStarter(): boolean {
  const starter = document.getElementById(STARTER_ID);
  if (!(starter instanceof HTMLDetailsElement)) return false;
  starter.open = true;
  starter.scrollIntoView({ block: "start" });
  starter.querySelector("summary")?.focus({ preventScroll: true });
  return true;
}

/** A link to this page's starter AGENTS.md. A real `#` link, so it still jumps without JS. */
export function StarterLink({
  page,
  className,
  children,
}: {
  page: StarterPage;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={`#${STARTER_ID}`}
      className={className}
      onClick={(e) => {
        if (!openStarter()) return;
        e.preventDefault();
        track({ name: "starter_open", page });
        history.pushState(null, "", `#${STARTER_ID}`);
      }}
    >
      {children}
    </a>
  );
}

/** A shared link to the draft: a closed `<details>` doesn't open on its own. Render once per page. */
export function OpenStarterOnHash() {
  useEffect(() => {
    if (window.location.hash === `#${STARTER_ID}`) openStarter();
  }, []);
  return null;
}

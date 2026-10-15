"use client";

import { CaretDown } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";

/**
 * A panel-styled native <details> that opens when the page is sent to `#id`.
 * Native so the content is in the HTML and toggles without JS. Links are
 * caught on click too: following a link to the hash already in the URL fires
 * no hashchange.
 */
export function HashDetails({
  id,
  summary,
  children,
}: {
  id: string;
  summary: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    // The browser's own jump is computed while the panel is still closed, and
    // the panel's height lands mid-scroll, so it stops short. Scroll after the
    // open has been laid out instead.
    const reveal = () => {
      if (!ref.current) return;
      ref.current.open = true;
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    };
    const onHash = () => {
      if (window.location.hash === `#${id}`) reveal();
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element | null)?.closest?.(`a[href="#${id}"]`)) return;
      e.preventDefault();
      history.pushState(null, "", `#${id}`);
      reveal();
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick);
    };
  }, [id]);

  return (
    <details ref={ref} className="group rounded-xl border border-line bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-5 py-4 group-open:rounded-b-none hover:bg-surface-hover [&::-webkit-details-marker]:hidden">
        {summary}
        <CaretDown size={14} weight="bold" aria-hidden="true" className="shrink-0 text-muted group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  );
}

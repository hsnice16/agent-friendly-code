"use client";

import { ListBullets, X } from "@phosphor-icons/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export type NavSection = { id: string; label: string };

// A section counts as current once its top is this close to the viewport top.
// A jump leaves it at its 80px scroll-margin plus its own top margin, so the
// line sits a little below that, or the section you just jumped to isn't lit.
const ACTIVE_LINE_PX = 128;

function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    // The last section whose top has passed the line, rather than an
    // IntersectionObserver: a jump, or a panel opening on arrival, can skip
    // past every threshold without firing it.
    const update = () => {
      frame = 0;
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= ACTIVE_LINE_PX) current = id;
      }
      setActive(current ?? ids[0] ?? null);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
    };
  }, [ids]);

  return active;
}

function SectionLinks({
  sections,
  active,
  onPick,
}: {
  sections: NavSection[];
  active: string | null;
  onPick?: () => void;
}) {
  return (
    <ul className="m-0 list-none space-y-0.5 border-l border-line p-0">
      {sections.map((s) => {
        const current = s.id === active;
        return (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={onPick}
              aria-current={current ? "location" : undefined}
              className={`-ml-px block border-l py-1 pl-3 text-[13px] leading-snug hover:text-ink ${
                current ? "border-ink font-medium text-ink" : "border-transparent text-muted"
              }`}
            >
              {s.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Sticky rail for the page margin; the links work without JS, which only adds the highlight. */
export function SectionNav({ sections }: { sections: NavSection[] }) {
  const active = useActiveSection(useMemo(() => sections.map((s) => s.id), [sections]));

  return (
    <nav aria-label="On this page" className="sticky top-20">
      <p className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">On this page</p>
      <SectionLinks sections={sections} active={active} />
    </nav>
  );
}

/** Where the margin is too narrow for the rail. Sits above BackToTop's slot so the two never overlap. */
export function FloatingSectionMenu({ sections }: { sections: NavSection[] }) {
  const active = useActiveSection(useMemo(() => sections.map((s) => s.id), [sections]));
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="fixed bottom-[4.5rem] right-6 z-30 flex flex-col items-end gap-2">
      <nav
        id={menuId}
        hidden={!open}
        aria-label="On this page"
        className="max-h-[60vh] w-56 overflow-y-auto rounded-xl border border-line bg-surface p-4 shadow-lg"
      >
        <p className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">On this page</p>
        <SectionLinks sections={sections} active={active} onPick={() => setOpen(false)} />
      </nav>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Close section menu" : "On this page"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-ink-dim shadow-sm hover:bg-surface-hover hover:text-ink-soft"
      >
        {open ? <X size={18} weight="bold" aria-hidden="true" /> : <ListBullets size={18} aria-hidden="true" />}
      </button>
    </div>
  );
}

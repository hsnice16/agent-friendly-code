"use client";

import { ListBullets, X } from "@phosphor-icons/react";
import { type RefObject, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useBeforeFooter, useViewportUpdate } from "@/lib/use-viewport-update";
import { activeSectionId } from "@/lib/utils/active-section";

export type NavSection = { id: string; label: string };

// A section counts as current once its top is this close to the viewport top.
// A jump leaves it at its 80px scroll-margin plus its own top margin, so the
// line sits a little below that, or the section you just jumped to isn't lit.
const ACTIVE_LINE_PX = 128;
// Scroll positions land on fractional pixels, so "at the bottom" allows a few.
const BOTTOM_SLACK_PX = 4;

function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  // The last section whose top has passed the line, rather than an
  // IntersectionObserver: a jump, or a panel opening on arrival, can skip
  // past every threshold without firing it.
  const update = useCallback(() => {
    const tops = ids.map((id) => ({ id, top: document.getElementById(id)?.getBoundingClientRect().top ?? null }));
    const root = document.documentElement;
    const atBottom = window.scrollY + window.innerHeight >= root.scrollHeight - BOTTOM_SLACK_PX;
    setActive(activeSectionId(tops, ACTIVE_LINE_PX, atBottom));
  }, [ids]);
  useViewportUpdate(update);

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
  const listRef = useRef<HTMLUListElement>(null);
  const marker = useMarker(listRef, active);

  return (
    <ul ref={listRef} className="relative m-0 list-none space-y-0.5 border-l border-line p-0 text-[13px] leading-snug">
      {marker && (
        <span
          aria-hidden="true"
          className={`absolute -left-px top-0 w-px bg-ink ${marker.animate ? "transition-[transform,height] duration-300 ease-out" : ""}`}
          style={{ height: marker.height, transform: `translateY(${marker.top}px)` }}
        />
      )}
      {sections.map((s) => {
        const current = s.id === active;
        return (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={onPick}
              aria-current={current ? "location" : undefined}
              data-section={s.id}
              className={`nav-link border-transparent ${current ? "font-medium text-ink" : "text-muted"}`}
            >
              {s.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

type Marker = { top: number; height: number; animate: boolean };

// One bar that slides to the current link instead of a border per link, which
// jumped. Measured, not computed, because labels wrap to two lines.
function useMarker(listRef: RefObject<HTMLUListElement | null>, active: string | null): Marker | null {
  const [marker, setMarker] = useState<Marker | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  // Slides only from a spot the reader saw: not on first placement, and not
  // when the floating menu reopens after the section changed while it was shut.
  const shown = useRef(false);

  const measure = useCallback(() => {
    const id = activeRef.current;
    const link = id ? listRef.current?.querySelector<HTMLElement>(`[data-section="${id}"]`) : null;
    // Zero-sized while the floating menu is closed.
    if (!link || link.offsetHeight === 0) {
      shown.current = false;
      return;
    }
    const next = { top: link.offsetTop, height: link.offsetHeight, animate: shown.current };
    shown.current = true;
    setMarker((prev) => (prev && prev.top === next.top && prev.height === next.height ? prev : next));
  }, [listRef]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `measure` reads `active` through a ref.
  useLayoutEffect(measure, [measure, active]);

  // Opening the floating menu and late font loads change the layout without changing `active`.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [listRef, measure]);

  return marker;
}

type SectionMenuProps = {
  sections: NavSection[];
  /** A page-level control, e.g. sharing, that should travel with the section links. */
  action?: React.ReactNode;
};

// Top edge of the rail action: bottom-6 plus the h-10 button, at the root's 20px font.
const ACTION_TOP_FROM_BOTTOM_PX = 80;
const ACTION_GAP_PX = 24;

// Shown only while the sections reach down to the button: past their end it
// would float beside the footer with nothing to belong to. A window too short
// for both would put it over the links.
function useRailActionVisible(navRef: RefObject<HTMLElement | null>, enabled: boolean): boolean {
  const [visible, setVisible] = useState(false);

  const update = useCallback(() => {
    const nav = navRef.current;
    const rail = nav?.parentElement;
    if (!nav || !rail) return;
    const links = nav.getBoundingClientRect();
    // Zero-sized below the rail breakpoint, where the floating menu carries the action.
    if (links.width === 0) return setVisible(false);
    const actionTop = window.innerHeight - ACTION_TOP_FROM_BOTTOM_PX;
    const sectionsEnded = rail.getBoundingClientRect().bottom < actionTop;
    const crowded = links.bottom > actionTop - ACTION_GAP_PX;
    setVisible(!sectionsEnded && !crowded);
  }, [navRef]);
  useViewportUpdate(update, enabled);

  return visible;
}

// Past the last section the rail's box ends and pushes it up the screen, under
// the sticky header, which it shows through; it fades out once it starts to move.
function useRailPushed(navRef: RefObject<HTMLElement | null>): boolean {
  const [pushed, setPushed] = useState(false);

  const update = useCallback(() => {
    const nav = navRef.current;
    const rect = nav?.getBoundingClientRect();
    // Zero-sized below the rail breakpoint.
    if (!nav || !rect || rect.width === 0) return setPushed(false);
    setPushed(rect.top < Number.parseFloat(getComputedStyle(nav).top) - 1);
  }, [navRef]);
  useViewportUpdate(update);

  return pushed;
}

/** Sticky rail for the page margin; the links work without JS, which only adds the highlight. */
export function SectionNav({ sections, action }: SectionMenuProps) {
  const active = useActiveSection(useMemo(() => sections.map((s) => s.id), [sections]));
  const navRef = useRef<HTMLElement>(null);
  const actionVisible = useRailActionVisible(navRef, Boolean(action));
  const pushed = useRailPushed(navRef);

  return (
    <>
      <nav
        ref={navRef}
        aria-label="On this page"
        className={`sticky top-20 transition-[opacity,visibility] duration-200 ${pushed ? "invisible opacity-0" : ""}`}
      >
        <p className="m-0 mb-2 text-[12.5px] eyebrow text-muted">On this page</p>
        <SectionLinks sections={sections} active={active} />
      </nav>
      {/* No left/right: a fixed box keeps its in-flow horizontal position, so it
          stays lined up with the rail at every width without measuring it.
          Unmounted rather than faded so an open menu doesn't come back open. */}
      {actionVisible && <div className="fixed bottom-6 z-30 animate-pop-in">{action}</div>}
    </>
  );
}

/** Where the margin is too narrow for the rail. Sits above BackToTop's slot so the two never overlap. */
export function FloatingSectionMenu({ sections, action }: SectionMenuProps) {
  const active = useActiveSection(useMemo(() => sections.map((s) => s.id), [sections]));
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const beforeFooter = useBeforeFooter();

  useEffect(() => {
    if (!beforeFooter) setOpen(false);
  }, [beforeFooter]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      btnRef.current?.focus();
    };
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

  if (!beforeFooter) return null;

  return (
    <div ref={rootRef} className="fixed bottom-[4.5rem] right-6 z-30 flex flex-col items-end gap-2">
      {action}
      {/* Anchored just above the toggle, so when open it covers `action` instead of pushing it up the screen. */}
      <nav
        id={menuId}
        hidden={!open}
        aria-label="On this page"
        className="absolute bottom-12 right-0 z-10 max-h-[60vh] w-56 overflow-y-auto rounded-xl border border-line bg-surface p-4 shadow-lg"
      >
        <p className="m-0 mb-2 text-[12.5px] eyebrow text-muted">On this page</p>
        <SectionLinks sections={sections} active={active} onPick={() => setOpen(false)} />
      </nav>
      <button
        ref={btnRef}
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

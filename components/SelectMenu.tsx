"use client";

import { CaretDown, Check } from "@phosphor-icons/react";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

export type SelectMenuOption = {
  label: string;
  value: string;
  shortLabel?: string;
};

type Props = {
  label: string;
  value: string;
  options: SelectMenuOption[];
  onChange: (value: string) => void;
};

// The ARIA listbox pattern: focus moves to the list, and aria-activedescendant
// names the highlighted option, so screen readers announce option and selection.
export function SelectMenu({ label, options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const current = options[selectedIndex];

  useEffect(() => {
    if (!open) {
      return;
    }

    listRef.current?.focus();

    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const openMenu = () => {
    setActive(selectedIndex);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    btnRef.current?.focus();
  };

  const select = (v: string) => {
    onChange(v);
    close();
  };

  const onTriggerKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openMenu();
    }
  };

  const onListKey = (e: KeyboardEvent) => {
    const last = options.length - 1;
    const moves: Record<string, number> = {
      ArrowDown: Math.min(active + 1, last),
      ArrowUp: Math.max(active - 1, 0),
      Home: 0,
      End: last,
    };

    if (e.key in moves) {
      e.preventDefault();
      setActive(moves[e.key]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(options[active].value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id}-list`}
        onKeyDown={onTriggerKey}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[13px] text-ink-dim hover:text-ink-soft"
      >
        <span className="whitespace-nowrap">{current.shortLabel ?? current.label}</span>
        <CaretDown size={11} weight="bold" aria-hidden="true" className="text-muted" />
      </button>

      <div
        ref={listRef}
        id={`${id}-list`}
        role="listbox"
        tabIndex={-1}
        aria-label={label}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        inert={!open}
        onKeyDown={onListKey}
        // Tab, a screen reader or a window switch: closing after focus has
        // moved keeps `inert` from landing on the focused list.
        onBlur={(e) => {
          if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
        }}
        className={`absolute left-0 top-full z-30 mt-1 min-w-[220px] origin-top-left overflow-hidden rounded-md border border-line bg-surface shadow-md outline-none transition duration-150 ease-out sm:left-auto sm:right-0 sm:origin-top-right ${
          open ? "scale-100 opacity-100 pointer-events-auto" : "scale-0 opacity-0 pointer-events-none"
        }`}
      >
        {options.map((o, i) => {
          const selected = o.value === value;
          return (
            // biome-ignore lint/a11y/useKeyWithClickEvents: the listbox handles keys via aria-activedescendant
            <div
              key={o.value}
              id={`${id}-${i}`}
              role="option"
              tabIndex={-1}
              aria-selected={selected}
              onClick={() => select(o.value)}
              onMouseEnter={() => setActive(i)}
              className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left text-[13px] ${
                open && i === active ? "bg-surface-hover text-ink" : selected ? "text-ink" : "text-ink-dim"
              }`}
            >
              <span>{o.label}</span>
              {selected && <Check size={12} weight="bold" aria-hidden="true" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { CaretDown, Check } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

export type SelectMenuOption = {
  value: string;
  label: string;
  shortLabel?: string;
};

type Props = {
  label: string;
  value: string;
  options: SelectMenuOption[];
  onChange: (value: string) => void;
};

export function SelectMenu({ label, options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const select = (v: string) => {
    onChange(v);
    setOpen(false);
    btnRef.current?.focus();
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[13px] text-ink-dim hover:text-ink-soft"
      >
        <span className="whitespace-nowrap">{current.shortLabel ?? current.label}</span>
        <CaretDown size={11} weight="bold" aria-hidden="true" className="text-muted" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute right-0 top-full z-30 mt-1 min-w-[220px] overflow-hidden rounded-md border border-line bg-surface shadow-md"
        >
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <div key={o.value} role="option" tabIndex={-1} aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => select(o.value)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left text-[13px] ${
                    selected ? "text-ink" : "text-ink-dim"
                  } hover:bg-surface-hover hover:text-ink`}
                >
                  <span>{o.label}</span>
                  {selected && <Check size={12} weight="bold" aria-hidden="true" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

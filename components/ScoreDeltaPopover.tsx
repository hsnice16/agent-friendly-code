"use client";

import { Info } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";

type Props = {
  current: number;
  previous: number;
  lastScoredAt: number | null;
};

export function ScoreDeltaPopover({ current, previous, lastScoredAt }: Props) {
  const dialogId = useId();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const diff = Math.round((current - previous) * 10) / 10;
  const down = diff < 0;

  const absDate = lastScoredAt
    ? new Date(lastScoredAt * 1000).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleEnter = () => {
    cancelClose();
    setOpen(true);
  };

  const handleLeave = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.blur();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  return (
    <div className="relative mt-1.5 inline-block">
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        onBlur={handleLeave}
        onFocus={handleEnter}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex cursor-pointer items-center gap-1 text-[12px] leading-none tabular-nums"
        aria-label={`${down ? "Down" : "Up"} ${Math.abs(diff).toFixed(1)} points from previous overall ${previous.toFixed(1)}. Activate or focus for score history.`}
      >
        <span className={down ? "font-medium text-bad" : "font-medium text-ok"}>
          {diff > 0 ? "+" : ""}
          {diff.toFixed(1)}
        </span>
        <span className="text-muted"> · was {previous.toFixed(1)}</span>
        <Info size={12} aria-hidden="true" className="block shrink-0 text-muted" />
      </button>

      <div
        id={dialogId}
        role="dialog"
        aria-label="Score history"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={`absolute left-0 top-full z-30 mt-2 w-[220px] origin-top-left rounded-md border border-line bg-surface p-3 text-left text-[12.5px] shadow-md transition duration-150 ease-out sm:left-1/2 sm:origin-top sm:-translate-x-1/2 ${
          open ? "scale-100 opacity-100 pointer-events-auto" : "scale-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Score history</div>
        <dl className="space-y-1">
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Now</dt>
            <dd className="font-medium text-ink tabular-nums">{current.toFixed(1)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Previous</dt>
            <dd className="font-medium text-ink tabular-nums">{previous.toFixed(1)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Change</dt>
            <dd className={`font-medium tabular-nums ${down ? "text-bad" : "text-ok"}`}>
              {diff > 0 ? "+" : ""}
              {diff.toFixed(1)} pts
            </dd>
          </div>

          {absDate && (
            <div className="flex justify-between gap-2 border-t border-line pt-1.5">
              <dt className="text-muted">Scored</dt>
              <dd className="font-medium text-ink-soft">{absDate}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

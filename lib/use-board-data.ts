"use client";

import { useSyncExternalStore } from "react";

import type { BoardData } from "@/lib/board";

type Status = "idle" | "loading" | "ready" | "error";

// One copy per tab: every board (and every client-side visit to another one)
// re-cuts the same payload, so it is fetched at most once.
let status: Status = "idle";
let data: BoardData | null = null;
let inflight: Promise<BoardData> | null = null;
const listeners = new Set<() => void>();

function set(next: Status) {
  status = next;
  for (const l of listeners) l();
}

// Long enough for a slow phone network, short enough that a stalled request
// turns into a retry button instead of placeholders that never resolve.
const TIMEOUT_MS = 15_000;

export function loadBoardData(): Promise<BoardData> {
  if (data) return Promise.resolve(data);
  if (inflight) return inflight;

  set("loading");
  const signal = typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(TIMEOUT_MS) : undefined;
  inflight = fetch("/api/board", { signal })
    .then((res) => {
      if (!res.ok) throw new Error(`Board data: HTTP ${res.status}`);
      return res.json() as Promise<BoardData>;
    })
    .then((d) => {
      if (!Array.isArray(d?.models) || !Array.isArray(d?.repos)) throw new Error("Board data: unexpected shape");
      return d;
    })
    .then(
      (d) => {
        data = d;
        inflight = null;
        set("ready");
        return d;
      },
      (err) => {
        inflight = null;
        set("error");
        throw err;
      },
    );
  return inflight;
}

/** Starts the download early (hover, focus, touch); failures surface when the board needs it. */
export function prefetchBoardData() {
  loadBoardData().catch(() => {});
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useBoardData(): { status: Status; data: BoardData | null } {
  const s = useSyncExternalStore(
    subscribe,
    () => status,
    () => "idle" as const,
  );
  return { status: s, data: s === "ready" ? data : null };
}

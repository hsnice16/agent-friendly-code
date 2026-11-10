import type { MouseEvent } from "react";

import { type BoardQuery, parseBoardQuery } from "@/lib/board";
import { RECUT_KEYS } from "@/lib/constants/board";

// Browser-only helpers for the board's address; call them from effects and handlers.

/** The board's own params, plus `model`, which a legacy redirect leaves behind. */
const BOARD_KEYS = new Set<string>([...RECUT_KEYS, "page", "model"]);

function pageFromPath(pathname: string): number {
  const m = /\/page\/(\d+)$/.exec(pathname);
  return m ? Number(m[1]) : 1;
}

/** `?page` wins when valid; otherwise a prerendered `/page/<n>` path says which page. */
export function readBoardLocation(): BoardQuery {
  const params = new URLSearchParams(window.location.search);
  const query = parseBoardQuery(params);
  const page = Number(params.get("page"));
  return params.has("page") && Number.isFinite(page) && page >= 1
    ? query
    : { ...query, page: pageFromPath(window.location.pathname) };
}

/** Whether the address is this board (its base path or one of its pages), not another route. */
export function isBoardPath(basePath: string): boolean {
  const path = window.location.pathname;
  const prefix = basePath === "/" ? "" : basePath;
  return path === basePath || new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/page/\\d+$`).test(path);
}

/**
 * Next.js picks these up, so its router and hooks see the new address. The
 * current history state is passed on: until Next patches the history API, a
 * null state would erase the entry Back needs. Params that aren't the board's
 * (utm_*, gclid) are kept for analytics.
 */
export function writeBoardLocation(href: string, mode: "push" | "replace") {
  const url = new URL(href, window.location.origin);
  for (const [key, value] of new URLSearchParams(window.location.search)) {
    if (!BOARD_KEYS.has(key)) url.searchParams.append(key, value);
  }
  const next = url.pathname + url.search;
  if (next === window.location.pathname + window.location.search) return;
  const state = window.history.state;
  if (mode === "push") {
    window.history.pushState(state, "", next);
  } else {
    window.history.replaceState(state, "", next + window.location.hash);
  }
}

/** A click the page may handle itself; a new-tab or download click stays the browser's. */
export function isPlainClick(e: MouseEvent): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

import { track } from "@/lib/analytics-events";
import { type BoardQuery, type BoardRow, viewBoard } from "@/lib/board";
import { isBoardPath, readBoardLocation } from "@/lib/board-location";
import type { ModelId } from "@/lib/scoring/weights";
import { boardBasePath } from "@/lib/utils/leaderboard-href";

// Long enough to skip the keystrokes of one word; GA, screen readers and the
// address bar only hear about the query someone settled on.
export const SEARCH_SETTLE_MS = 350;

/**
 * One `search` event per settled query, counted once the rows exist, like the
 * server-side count it replaces: a host or sort change re-counts but isn't a new search.
 */
export function useSearchTracking(
  settledQ: string,
  rows: BoardRow[] | null,
  model: string,
  queryRef: RefObject<BoardQuery>,
) {
  const tracked = useRef<string | null>(null);
  useEffect(() => {
    if (!settledQ || !rows) return;
    const key = `${model}:${settledQ}`;
    if (tracked.current === key) return;
    tracked.current = key;
    const results = viewBoard(rows, { ...queryRef.current, q: settledQ }).total;
    track({ name: "search", search_term: settledQ, results, board: model });
  }, [settledQ, rows, model, queryRef]);
}

/** Rows change in place now, with no page load to tell a screen reader. */
export function useResultAnnouncement(recut: boolean, total: number | undefined): string {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!recut || total == null) {
      setText("");
      return;
    }
    const t = setTimeout(
      () => setText(total === 0 ? "No repos match." : `${total} ${total === 1 ? "repo" : "repos"} shown.`),
      SEARCH_SETTLE_MS,
    );
    return () => clearTimeout(t);
  }, [recut, total]);
  return text;
}

/**
 * Back and Forward between pages of a re-cut board: history entries the board
 * pushed rather than routes. Back to another route is Next's to render.
 */
export function useBoardPopState(model: ModelId | "overall", onRead: (query: BoardQuery) => void) {
  const handler = useRef(onRead);
  handler.current = onRead;
  useEffect(() => {
    const onPop = () => {
      if (isBoardPath(boardBasePath(model))) handler.current(readBoardLocation());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [model]);
}

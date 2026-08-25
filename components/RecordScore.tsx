"use client";

import { useEffect } from "react";

import { type RecentScore, writeRecent } from "@/lib/live-score/recents";

/** Records a successful live score so /score can offer it back. Renders nothing. */
export function RecordScore({ host, owner, name, score }: RecentScore) {
  // Primitives, not the props object: a fresh object identity every render would
  // re-run the write on every render.
  useEffect(() => {
    writeRecent({ host, owner, name, score });
  }, [host, owner, name, score]);

  return null;
}

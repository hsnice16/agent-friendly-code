"use client";

import { useEffect, useState } from "react";

import { relativeTime } from "@/lib/utils/format";

/**
 * A prerendered page would freeze "5h ago" at build time, so the server sends
 * the date and the browser swaps in the relative form.
 */
export function RelativeTime({ epochSec, fallback }: { epochSec: number; fallback: string }) {
  const [text, setText] = useState(fallback);
  useEffect(() => setText(relativeTime(epochSec)), [epochSec]);
  return <time dateTime={new Date(epochSec * 1000).toISOString()}>{text}</time>;
}

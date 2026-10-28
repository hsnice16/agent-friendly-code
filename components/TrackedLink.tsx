"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { type AnalyticsEvent, track } from "@/lib/analytics-events";

/** A `<Link>` that sends `event` on click, for links inside server components. */
export function TrackedLink({ event, ...props }: ComponentProps<typeof Link> & { event: AnalyticsEvent }) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        track(event);
        props.onClick?.(e);
      }}
    />
  );
}

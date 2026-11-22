"use client";

import Link from "next/link";
import { type ComponentProps, useState } from "react";

/**
 * A `<Link>` that prefetches once the visitor points at, touches or focuses it,
 * for long lists: viewport prefetch fetched every visible row's page, each a
 * billed ISR read, though few are opened. Pointer events cover touch, so a tap
 * starts the prefetch before its click.
 */
export function IntentLink({
  onPointerEnter,
  onPointerDown,
  onFocus,
  ...props
}: Omit<ComponentProps<typeof Link>, "prefetch">) {
  const [active, setActive] = useState(false);

  return (
    <Link
      {...props}
      prefetch={active ? null : false}
      onPointerEnter={(e) => {
        setActive(true);
        onPointerEnter?.(e);
      }}
      onPointerDown={(e) => {
        setActive(true);
        onPointerDown?.(e);
      }}
      onFocus={(e) => {
        setActive(true);
        onFocus?.(e);
      }}
    />
  );
}

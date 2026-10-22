import { useCallback, useEffect, useState } from "react";

/**
 * Runs `update` on mount and at most once a frame after a scroll, resize or
 * hash change. Pass a stable `update` (useCallback): a new one re-subscribes.
 */
export function useViewportUpdate(update: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const run = () => {
      frame = 0;
      update();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(run);
    };

    run();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
    };
  }, [update, enabled]);
}

/** False once the footer scrolls into view, where floating page controls would cover its links. */
export function useBeforeFooter(): boolean {
  const [visible, setVisible] = useState(false);

  const update = useCallback(() => {
    const footer = document.querySelector("footer")?.getBoundingClientRect();
    setVisible(footer == null || footer.top >= window.innerHeight);
  }, []);
  useViewportUpdate(update);

  return visible;
}

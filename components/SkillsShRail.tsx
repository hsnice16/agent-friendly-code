"use client";

import { useBeforeFooter } from "@/lib/use-viewport-update";

import { SkillsShBadge } from "./SkillsShBadge";

/** The badge pinned to the bottom of the right margin; place it as a direct child of <main>. */
export function SkillsShRail() {
  const visible = useBeforeFooter();

  // left-full of a content-wide box is the right margin, where the "On this
  // page" rail sits on other pages; below 1600px there is no margin. The fixed
  // card has no left/right, so it keeps that in-flow horizontal position.
  return (
    <div className="relative hidden min-[1600px]:block">
      <div className="absolute left-full ml-10">
        {visible && (
          <div className="fixed bottom-6 z-20 animate-pop-in">
            <SkillsShBadge />
          </div>
        )}
      </div>
    </div>
  );
}

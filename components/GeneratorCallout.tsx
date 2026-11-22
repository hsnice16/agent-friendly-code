"use client";

import { ArrowRight, ArrowUp } from "@phosphor-icons/react";

import type { GeneratorCtaPage } from "@/lib/analytics-events";
import { GENERATOR_PATH } from "@/lib/utils/generator-path";

import { OpenStarterOnHash, StarterLink, type StarterPage } from "./StarterLink";
import { TrackedLink } from "./TrackedLink";

const BUTTON = "group btn-primary btn-sm shrink-0 max-sm:w-full";
const ICON = "transition-transform duration-150";

export function GeneratorCallout({
  page,
  className = "",
  starterOn,
}: {
  page: GeneratorCtaPage;
  className?: string;
  /** The page already shows this repo's starter; the generator would only ask for the link again. */
  starterOn?: StarterPage;
}) {
  return (
    <aside className={`callout flex flex-wrap items-center gap-x-4 gap-y-3 ${className}`}>
      <span aria-hidden="true" className="glyph size-10 bg-tip/10 text-tip">
        <span className="icon-file-text" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[15px] font-semibold text-ink">
          {starterOn ? "No usable AGENTS.md yet? Start from this draft." : "Writing one for your repo?"}
        </p>
        <p className="m-0 mt-0.5 text-[13.5px] text-ink-dim">
          {starterOn
            ? "Drafted from what the scan found. Fill in the commands, then commit it at the root."
            : "Paste a public GitHub link for a starter AGENTS.md drafted from what the scan finds. Free."}
        </p>
      </div>
      {starterOn ? (
        <>
          <OpenStarterOnHash />
          <StarterLink page={starterOn} className={BUTTON}>
            Show the draft
            <ArrowUp size={14} weight="bold" aria-hidden="true" className={`${ICON} group-hover:-translate-y-0.5`} />
          </StarterLink>
        </>
      ) : (
        <TrackedLink
          href={GENERATOR_PATH}
          prefetch={false}
          event={{ name: "generator_cta_click", page }}
          className={BUTTON}
        >
          Draft an AGENTS.md
          <ArrowRight size={14} weight="bold" aria-hidden="true" className={`${ICON} group-hover:translate-x-0.5`} />
        </TrackedLink>
      )}
    </aside>
  );
}

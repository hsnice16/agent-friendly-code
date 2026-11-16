import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { TrackedLink } from "./TrackedLink";

// Most visitors land on a repo page from a search for that repo, not their own;
// the form lives on the home page and /score, so this only points at it.
export function LiveScoreNudge() {
  return (
    <aside className="callout mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-3">
      <span aria-hidden="true" className="glyph size-10 bg-tip/10 text-tip">
        <span className="icon-gauge" />
      </span>
      {/* On phones the floating "On this page" button sits over the card's right end. */}
      <div className="min-w-0 flex-1 max-sm:pr-11">
        <p className="m-0 text-[15px] font-semibold text-ink">Is your repo ready for AI agents?</p>
        <p className="m-0 mt-0.5 text-[13.5px] text-ink-dim">A score per agent and what to fix first, free.</p>
      </div>
      <TrackedLink
        href="/score"
        event={{ name: "score_nudge_click" }}
        className="group btn-primary btn-sm shrink-0 max-sm:w-full"
      >
        Score your repo
        <ArrowRight
          size={14}
          weight="bold"
          aria-hidden="true"
          className="transition-transform duration-150 group-hover:translate-x-0.5"
        />
      </TrackedLink>
    </aside>
  );
}

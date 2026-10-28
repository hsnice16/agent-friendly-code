import { ArrowRight, Gauge } from "@phosphor-icons/react/dist/ssr";
import { TrackedLink } from "./TrackedLink";

// Most visitors land on a repo page from a search for that repo, not their own;
// the form lives on the home page and /score, so this only points at it.
export function LiveScoreNudge() {
  return (
    <aside className="mt-3.5 flex flex-col gap-3 rounded-xl border border-tip/40 bg-tip/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Gauge size={22} weight="duotone" aria-hidden="true" className="mt-0.5 shrink-0 text-tip" />
        <p className="m-0 text-[14.5px] text-ink-soft">
          <span className="font-semibold text-ink">How agent-friendly is your repo?</span> Score any public GitHub repo
          in seconds.
        </p>
      </div>
      <TrackedLink
        href="/score"
        event={{ name: "score_nudge_click" }}
        className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-accent px-3.5 py-2 text-[13.5px] font-medium text-accent-ink no-underline hover:opacity-90 hover:no-underline sm:self-auto"
      >
        Score your repo
        <ArrowRight size={14} weight="bold" aria-hidden="true" />
      </TrackedLink>
    </aside>
  );
}

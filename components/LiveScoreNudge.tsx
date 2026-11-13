import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { TrackedLink } from "./TrackedLink";

// Most visitors land on a repo page from a search for that repo, not their own;
// the form lives on the home page and /score, so this only points at it.
export function LiveScoreNudge() {
  return (
    <aside className="callout mt-3.5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* On phones the floating "On this page" button sits over the card's right end. */}
      <p className="m-0 text-[15px] font-semibold text-ink max-sm:pr-11">Is your repo ready for AI agents?</p>
      <TrackedLink href="/score" event={{ name: "score_nudge_click" }} className="btn-primary shrink-0">
        Score your repo
        <ArrowRight size={15} weight="bold" aria-hidden="true" />
      </TrackedLink>
    </aside>
  );
}

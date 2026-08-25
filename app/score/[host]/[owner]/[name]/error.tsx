"use client";

import Link from "next/link";
import { Panel } from "@/components/Panel";

// Reached when scoring failed for a reason that could resolve on its own — a
// host rate limit, a timeout. It exists so page.tsx can throw instead of
// rendering an apology: a throw is never cached, so the failure is not served
// to everyone else for the next hour.
export default function LiveScoreError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Panel>
      <h1 className="m-0 text-[19px] font-semibold tracking-tight">Couldn&apos;t score this repo right now</h1>
      <p className="mt-2 max-w-[64ch] text-[14.5px] text-ink-dim">
        Nothing is necessarily wrong with the repository — the host&apos;s API may be rate-limiting us, or the tree took
        too long to read. Trying again usually works.
      </p>

      <div className="mt-3.5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-lg border border-line bg-ink px-4 py-2 text-[14px] font-medium text-accent-ink hover:bg-ink-soft"
        >
          Try again
        </button>
        <Link href="/score" className="text-[14px] text-ink-dim hover:text-ink">
          ← score another repo
        </Link>
      </div>
    </Panel>
  );
}

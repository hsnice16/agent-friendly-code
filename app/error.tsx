"use client";

import Link from "next/link";

import { Panel } from "@/components/Panel";

// Without this, an unexpected throw anywhere below the root layout replaces
// the whole page, nav and footer included, with Next's bare error screen.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Panel>
      <h1 className="m-0 text-[19px] font-semibold tracking-tight">Something went wrong on this page</h1>
      <p className="mt-2 max-w-[64ch] text-[14.5px] text-ink-dim">
        It was our error, not something you did. Trying again usually works.
      </p>

      <div className="mt-3.5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-lg border border-line bg-ink px-4 py-2 text-[14px] font-medium text-accent-ink hover:bg-ink-soft"
        >
          Try again
        </button>
        <Link href="/" className="text-[14px] text-ink-dim hover:text-ink">
          ← back to the leaderboard
        </Link>
      </div>
    </Panel>
  );
}

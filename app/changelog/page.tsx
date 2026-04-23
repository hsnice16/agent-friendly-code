import type { Metadata } from "next";
import Link from "next/link";

import { Panel } from "@/components/Panel";
import { CHANGELOG } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  twitter: { title: "Changelog" },
  alternates: { canonical: "/changelog" },
  openGraph: { title: "Changelog", url: "/changelog" },
  description:
    "What's shipped in each release of Agent Friendly Code — user-facing capabilities, not internal churn. Every bullet corresponds to a roadmap item that landed.",
};

export default function ChangelogPage() {
  return (
    <>
      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">Changelog</h1>
        <p className="m-0 max-w-[70ch] text-[15.5px] text-ink-dim">
          What&apos;s shipped from the{" "}
          <Link href="/roadmap" className="text-ink-dim underline-offset-4 hover:text-ink-soft hover:underline">
            roadmap
          </Link>
          , not a dev log. Every bullet corresponds to a roadmap item that landed.
        </p>
      </section>

      <Panel>
        {CHANGELOG.map((entry) => (
          <div key={entry.label} className="border-b border-line py-6 first:pt-0 last:border-b-0 last:pb-0">
            <div className="mb-2.5 flex flex-wrap items-baseline gap-3.5">
              <span className="inline-block rounded-md border border-line bg-surface-2 px-2.5 py-[3px] font-mono text-[13px] font-semibold text-accent">
                {entry.label}
              </span>
              <span className="mr-auto text-lg font-semibold tracking-tight">{entry.title}</span>
              <span className="tabular-nums text-sm text-muted">{entry.date}</span>
            </div>
            <ul className="m-0 pl-5 text-[14.5px] text-ink-dim">
              {entry.highlights.map((h) => (
                <li key={h} className="my-1">
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Panel>
    </>
  );
}

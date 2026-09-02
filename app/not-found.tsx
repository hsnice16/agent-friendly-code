import type { Metadata } from "next";
import Link from "next/link";

import { Panel, PanelHeading } from "@/components/Panel";
import { APP_NAME } from "@/lib/version";

export const metadata: Metadata = {
  title: "Not found",
  // Next tags this route noindex itself; the layout's `index, follow` is
  // emitted beside it, so it is restated here and the two tags agree.
  robots: { index: false, follow: true },
  description: `Nothing is published at this address on ${APP_NAME}.`,
};

const DESTINATIONS = [
  { href: "/", label: "Leaderboard", blurb: "Every indexed repo, ranked overall and per model." },
  {
    href: "/score",
    label: "Live Score",
    blurb: "Paste any public GitHub repository URL and score it from its current commit.",
  },
  {
    href: "/package",
    label: "Packages",
    blurb: "The same scores, reached by npm, PyPI or Cargo package name.",
  },
  { href: "/skill", label: "Agent Skill", blurb: "Score the repo you are in, on disk and offline." },
  { href: "/action", label: "GitHub Action", blurb: "Score a PR against its base in CI and comment the delta." },
  { href: "/methodology", label: "Methodology", blurb: "The signals, the per-model weights, and what they miss." },
];

/**
 * Reached most often from `notFound()` in the repo, score and package routes
 * rather than from a mistyped address, so the first thing on it is the page
 * that works for a repo we have never seen.
 */
export default function NotFound() {
  return (
    <>
      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">Page not found</h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">Nothing is published at this address.</p>
      </section>

      <Panel tone="info">
        <PanelHeading tone="info">Looking for a repository?</PanelHeading>
        <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
          A repo or package page exists only for what has been indexed, so a link kept from an earlier run — or a
          repository never on the leaderboard — lands here.{" "}
          <Link
            href="/score"
            className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
          >
            Live Score
          </Link>{" "}
          takes any public GitHub URL and scores it on the spot, indexed or not.
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Everywhere else</PanelHeading>
          <ul className="m-0 grid list-none gap-2.5 p-0">
            {DESTINATIONS.map((d) => (
              <li key={d.href} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                <Link href={d.href} className="min-w-[9rem] text-[14.5px] font-semibold text-ink hover:text-ink-soft">
                  {d.label}
                </Link>
                <span className="text-[14px] leading-relaxed text-muted">{d.blurb}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

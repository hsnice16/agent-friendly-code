import type { Metadata } from "next";
import Link from "next/link";

import { Panel, PanelHeading } from "@/components/Panel";
import { APP_NAME } from "@/lib/version";

export const metadata: Metadata = {
  title: "Not found",
  // Next tags this route noindex itself; the layout's `index, follow` is
  // emitted beside it, so it is restated here and the two tags agree.
  robots: { index: false, follow: true },
  description: `There is no page at this address on ${APP_NAME}.`,
};

const DESTINATIONS = [
  { href: "/", label: "Leaderboard", blurb: "Every repo we track, ranked overall and for each agent." },
  {
    href: "/score",
    label: "Live Score",
    blurb: "Paste a public GitHub repo link and get its score from the latest commit.",
  },
  {
    href: "/package",
    label: "Packages",
    blurb: "Look up the same scores by npm, PyPI or Cargo package name.",
  },
  { href: "/language", label: "Languages", blurb: "The same ranking, split by programming language." },
  { href: "/skill", label: "Agent Skill", blurb: "Score the repo on your computer, offline." },
  {
    href: "/action",
    label: "GitHub Action",
    blurb: "Score each pull request in CI and comment how the score changed.",
  },
  {
    href: "/methodology",
    label: "Methodology",
    blurb: "What we check, how much each check counts per agent, and what we miss.",
  },
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
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">There is no page at this address.</p>
      </section>

      <Panel tone="info">
        <PanelHeading tone="info">Looking for a repo?</PanelHeading>
        <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
          We only have pages for repos and packages we track. An old link, or a repo that was never on the list, ends up
          here.{" "}
          <Link
            href="/score"
            className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
          >
            Live Score
          </Link>{" "}
          scores any public GitHub repo right away, even one we don&apos;t track.
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

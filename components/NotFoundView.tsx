"use client";

import Link from "next/link";

import { PACKAGE_PATH } from "@/lib/utils/package-path";
import { IntentLink } from "./IntentLink";
import { PageHeader } from "./PageHeader";
import { Panel, PanelHeading } from "./Panel";

// A client component: the root layout puts the not-found tree in every page's RSC payload,
// so its markup would otherwise ship with each one.

const DESTINATIONS = [
  { href: "/", label: "Leaderboard", blurb: "Every repo we track, ranked overall and for each agent." },
  {
    href: "/score",
    label: "Live Score",
    blurb: "Score any public GitHub repo from its latest commit.",
  },
  {
    href: PACKAGE_PATH,
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

export function NotFoundView() {
  return (
    <>
      <PageHeader title="Page not found" lead="There is no page at this address." />

      <Panel tone="tip">
        <PanelHeading tone="tip" icon="search">
          Looking for a repo?
        </PanelHeading>
        <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
          We have pages only for repos and packages we track; an old link, or a repo never on the list, ends up here.{" "}
          <Link href="/score" className="prose-link">
            Live Score
          </Link>{" "}
          scores any public GitHub repo right away, even one we don&apos;t track.
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Everywhere else</PanelHeading>
          <ul className="m-0 grid list-none p-0">
            {DESTINATIONS.map((d) => (
              <li key={d.href} className="flex flex-col gap-0.5 link-row sm:flex-row sm:items-baseline sm:gap-3">
                <IntentLink href={d.href} className="min-w-[9rem] text-[14.5px] font-semibold ink-link cover-link">
                  {d.label}
                </IntentLink>
                <span className="text-[14px] leading-relaxed text-muted">{d.blurb}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

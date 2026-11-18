import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HubLeaderboardTable } from "@/components/HubLeaderboardTable";
import { PAGE_LEAD, PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { examplesByLanguage } from "@/lib/agents-md-examples";
import { LANGUAGE_AGENTS_MIN_REPOS } from "@/lib/constants/scoring";
import { getHub, getLanguageGroups, type Hub } from "@/lib/language-hubs";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { checkPath, languageExamplesPath } from "@/lib/utils/check-path";
import { hubPath, hubTitle, isHub, languageAgentsPath } from "@/lib/utils/language";
import { fitDescription, pageTitle } from "@/lib/utils/page-title";
import { repoPath } from "@/lib/utils/repo-path";
import { DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getLanguageGroups()
    .filter(isHub)
    .map((g) => ({ slug: g.slug }));
}

function hubDescription(hub: Hub): string {
  const top = `${hub.top.owner}/${hub.top.name}`;
  return fitDescription(
    `${hub.rows.length} ${hub.label} repos ranked by how ready they are for AI coding agents like Claude Code and Cursor.`,
    `Average score ${hub.average.toFixed(1)}.`,
    `${top} leads with ${(hub.top.score ?? 0).toFixed(1)}.`,
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const hub = getHub((await params).slug);
  if (!hub) {
    return {};
  }

  const path = hubPath(hub.slug);
  const title = hubTitle(hub.label);
  const description = hubDescription(hub);

  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: path },
    twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description },
    openGraph: { ...OG_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description, url: path, type: "website" },
  };
}

export default async function LanguageHubPage({ params }: { params: Promise<Params> }) {
  const hub = getHub((await params).slug);
  if (!hub) {
    notFound();
  }

  const path = hubPath(hub.slug);
  const examples = examplesByLanguage(getAgentsMdExamples()).find((l) => l.slug === hub.slug);

  return (
    <>
      <PageHeader
        crumbs={{ parents: [{ name: "Languages", path: "/language" }], current: { name: hub.label, path } }}
        title={hubTitle(hub.label)}
        lead={
          <>
            {hub.rows.length} {hub.label} repos, ranked by overall score (the average across agents). They average{" "}
            <strong className="text-ink">{hub.average.toFixed(1)}</strong>, and{" "}
            <Link href={repoPath(hub.top)} className="prose-link">
              {hub.top.owner}/{hub.top.name}
            </Link>{" "}
            leads with <strong className="text-ink">{(hub.top.score ?? 0).toFixed(1)}</strong>.
          </>
        }
      >
        {examples && (
          <p className={`mt-2.5 ${PAGE_LEAD}`}>
            {examples.rows.length} of them have an AGENTS.md or CLAUDE.md:{" "}
            <Link href={languageExamplesPath(hub.slug)} className="prose-link">
              {hub.label} AGENTS.md examples
            </Link>
            .
          </p>
        )}
        {hub.rows.length >= LANGUAGE_AGENTS_MIN_REPOS && (
          <p className="mt-2.5 mb-0 text-[14.5px]">
            <Link href={languageAgentsPath(hub.slug)} className="arrow-link whitespace-normal">
              Which AI coding agent {hub.label} repos are best set up for →
            </Link>
          </p>
        )}
      </PageHeader>

      {hub.gaps.length > 0 && (
        <div className="mb-3.5">
          <Panel>
            <PanelHeading>What {hub.label} repos most often miss</PanelHeading>
            <ul className="link-list">
              {hub.gaps.map((g) => (
                <li key={g.id} className="link-row">
                  <Link href={checkPath(g.id)} className="font-medium ink-link cover-link">
                    {g.label}
                  </Link>
                  : {Math.round(g.rate * 100)}% pass rate
                </li>
              ))}
            </ul>
            <p className="mt-3 mb-0 text-[13px] text-muted">
              Leaves out checks only one agent reads, which almost no repo passes. The{" "}
              <Link href="/methodology" className="prose-link">
                methodology
              </Link>{" "}
              explains each check.
            </p>
          </Panel>
        </div>
      )}

      <HubLeaderboardTable
        q=""
        page={1}
        host="all"
        startIdx={0}
        totalPages={1}
        rows={hub.rows}
        clearSearchHref={path}
        prefetch={false}
        activeLabel={`${hub.label} repos, overall`}
      />
    </>
  );
}

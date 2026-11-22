import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CommonGapsPanel } from "@/components/CommonGapsPanel";
import { HubLeaderboardTable } from "@/components/HubLeaderboardTable";
import { IntentLink } from "@/components/IntentLink";
import { LeaderClause } from "@/components/LeaderClause";
import { PAGE_LEAD, PageHeader } from "@/components/PageHeader";
import { frameworkLinksForLanguage } from "@/lib/agents-md-example-links";
import { examplesByLanguage } from "@/lib/agents-md-examples";
import { LANGUAGE_AGENTS_MIN_REPOS } from "@/lib/constants/scoring";
import { getHub, getLanguageGroups, type Hub } from "@/lib/language-hubs";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { leaderSentence } from "@/lib/leaderboard-meta";
import { languageExamplesPath } from "@/lib/utils/check-path";
import { hubPath, hubTitle, isHub, languageAgentsPath } from "@/lib/utils/language";
import { fitDescription, pageTitle } from "@/lib/utils/page-title";
import { DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getLanguageGroups()
    .filter(isHub)
    .map((g) => ({ slug: g.slug }));
}

function hubDescription(hub: Hub): string {
  return fitDescription(
    `${hub.rows.length} ${hub.label} repos ranked by how ready they are for AI coding agents like Claude Code and Cursor.`,
    `Average score ${hub.average.toFixed(1)}.`,
    ...(hub.top ? [leaderSentence(hub.top)] : []),
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
  const frameworks = frameworkLinksForLanguage(getAgentsMdExamples(), hub.slug);

  return (
    <>
      <PageHeader
        crumbs={{ parents: [{ name: "Languages", path: "/language" }], current: { name: hub.label, path } }}
        title={hubTitle(hub.label)}
        lead={
          <>
            {hub.rows.length} {hub.label} repos, ranked by overall score (the average across agents). They average{" "}
            <strong className="text-ink">{hub.average.toFixed(1)}</strong>.{hub.top && <LeaderClause top={hub.top} />}
          </>
        }
      >
        {examples && (
          <p className={`mt-2.5 ${PAGE_LEAD}`}>
            {examples.rows.length} of them have an AGENTS.md or CLAUDE.md:{" "}
            <IntentLink href={languageExamplesPath(hub.slug)} className="prose-link">
              {hub.label} AGENTS.md examples
            </IntentLink>
            {frameworks.map((f, i) => (
              <span key={f.href}>
                {i === 0 ? ", and guides for " : i === frameworks.length - 1 ? " and " : ", "}
                <IntentLink href={f.href} className="prose-link">
                  {f.label}
                </IntentLink>
              </span>
            ))}
            .
          </p>
        )}
        {hub.rows.length >= LANGUAGE_AGENTS_MIN_REPOS && (
          <p className="mt-2.5 mb-0 text-[14.5px]">
            <IntentLink href={languageAgentsPath(hub.slug)} className="arrow-link whitespace-normal">
              Which AI coding agent {hub.label} repos are best set up for →
            </IntentLink>
          </p>
        )}
      </PageHeader>

      <CommonGapsPanel label={hub.label} gaps={hub.gaps} />

      <HubLeaderboardTable
        q=""
        page={1}
        host="all"
        startIdx={0}
        totalPages={1}
        rows={hub.rows}
        clearSearchHref={path}
        activeLabel={`${hub.label} repos, overall`}
      />
    </>
  );
}

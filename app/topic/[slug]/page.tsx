import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CommonGapsPanel } from "@/components/CommonGapsPanel";
import { HubLeaderboardTable } from "@/components/HubLeaderboardTable";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { LeaderClause } from "@/components/LeaderClause";
import { PageHeader } from "@/components/PageHeader";
import { leaderSentence } from "@/lib/leaderboard-meta";
import { getTopicGroups, getTopicPage, type TopicPage } from "@/lib/topic-pages";
import { TOPICS_PATH, topicDescription, topicPath, topicTitle } from "@/lib/topics";
import { rowsItemList } from "@/lib/utils/board-item-list";
import { percent } from "@/lib/utils/format";
import { hubTitle } from "@/lib/utils/language";
import { pageTitle } from "@/lib/utils/page-title";
import { DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getTopicGroups().map((g) => ({ slug: g.slug }));
}

function description(t: TopicPage): string {
  return topicDescription({
    label: t.label,
    count: t.rows.length,
    average: t.average,
    leader: t.top && leaderSentence(t.top),
  });
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const t = getTopicPage((await params).slug);
  if (!t) {
    return {};
  }

  const path = topicPath(t.slug);
  const title = topicTitle(t.label);
  const desc = description(t);

  return {
    title: pageTitle(title),
    description: desc,
    alternates: { canonical: path },
    twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description: desc },
    openGraph: { ...OG_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description: desc, url: path, type: "website" },
  };
}

export default async function TopicPageView({ params }: { params: Promise<Params> }) {
  const t = getTopicPage((await params).slug);
  if (!t) {
    notFound();
  }

  const path = topicPath(t.slug);
  const vs = t.average >= t.boardAverage ? "above" : "below";

  return (
    <>
      <JsonLd data={rowsItemList(t.rows, hubTitle(t.label))} />
      <PageHeader
        crumbs={{ parents: [{ name: "Topics", path: TOPICS_PATH }], current: { name: t.label, path } }}
        title={hubTitle(t.label)}
        lead={
          <>
            {t.rows.length} repos tagged {t.label} average <strong className="text-ink">{t.average.toFixed(1)}</strong>,{" "}
            {vs} the leaderboard&apos;s {t.boardAverage.toFixed(1)}, and {percent(t.withAgentFile, t.rows.length)} have
            an AGENTS.md or CLAUDE.md.
            {t.top && <LeaderClause top={t.top} />}
          </>
        }
      />

      <CommonGapsPanel label={t.label} gaps={t.gaps} />

      <HubLeaderboardTable
        q=""
        page={1}
        host="all"
        startIdx={0}
        totalPages={1}
        rows={t.rows}
        clearSearchHref={path}
        activeLabel={`${t.label} repos, overall`}
      />

      {t.related.length > 0 && (
        <nav
          aria-label="Related topics"
          className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-muted"
        >
          <span>Related topics:</span>
          {t.related.map((g) => (
            <IntentLink key={g.slug} href={topicPath(g.slug)} className="dim-link">
              {g.label}
            </IntentLink>
          ))}
          <IntentLink href={TOPICS_PATH} className="arrow-link">
            All topics →
          </IntentLink>
        </nav>
      )}
    </>
  );
}

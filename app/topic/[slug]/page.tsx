import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { LeaderboardTable } from "@/components/LeaderboardTable";
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
    top: `${t.top.owner}/${t.top.name}`,
    topScore: t.top.score ?? 0,
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
      <Breadcrumbs parents={[{ name: "Topics", path: TOPICS_PATH }]} current={{ name: t.label, path }} />

      <section className="mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">{hubTitle(t.label)}</h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          {t.rows.length} repos tagged {t.label} average <strong className="text-ink">{t.average.toFixed(1)}</strong>,{" "}
          {vs} the leaderboard&apos;s {t.boardAverage.toFixed(1)}, and {percent(t.withAgentFile, t.rows.length)} of them
          have an AGENTS.md or CLAUDE.md.
        </p>
      </section>

      <LeaderboardTable
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
            <Link key={g.slug} href={topicPath(g.slug)} className="text-ink-dim hover:text-ink-soft">
              {g.label}
            </Link>
          ))}
          <Link href={TOPICS_PATH} className="text-ink-dim hover:text-ink-soft">
            All topics →
          </Link>
        </nav>
      )}
    </>
  );
}

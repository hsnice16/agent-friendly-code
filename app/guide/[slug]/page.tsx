import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CodeText } from "@/components/CodeText";
import { ExternalLink } from "@/components/ExternalLink";
import { FaqList } from "@/components/FaqList";
import { GuideBlocks } from "@/components/GuideBlocks";
import { JsonLd } from "@/components/JsonLd";
import { LINK } from "@/components/link-class";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import type { ExampleRow } from "@/lib/agents-md-examples";
import { AUTHOR_JSON_LD } from "@/lib/author";
import { getLeaderboardStats } from "@/lib/db";
import { GUIDES, guideBySlug } from "@/lib/guides";
import { fillStats, getGuideStats } from "@/lib/guides/stats";
import type { GuideBlock } from "@/lib/guides/types";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { distinctSourceLabels } from "@/lib/leaderboard-model-panel";
import { GUIDE_CRUMB, guidePath } from "@/lib/utils/guide-path";
import { pageTitle } from "@/lib/utils/page-title";
import { APP_NAME, APP_URL, DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  const stats = getGuideStats();
  const title = fillStats(g.title, stats);
  const description = fillStats(g.description, stats);
  const path = guidePath(g.slug);

  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: path },
    twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description },
    openGraph: { ...OG_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description, url: path, type: "article" },
  };
}

const baseName = (file: string) => file.split("/").pop()?.toLowerCase();

function examplesFor(rows: ExampleRow[], b: Extract<GuideBlock, { kind: "examples" }>): ExampleRow[] {
  return rows
    .filter((r) => baseName(r.file) === b.file.toLowerCase() && (b.language == null || r.language === b.language))
    .slice(0, b.limit);
}

export default async function GuidePage({ params }: { params: Params }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();

  const stats = getGuideStats();
  const fill = (text: string) => fillStats(text, stats);
  const rows = getAgentsMdExamples().rows;
  const path = guidePath(g.slug);
  const { contentChangedAt } = getLeaderboardStats();
  const title = fill(g.title);

  return (
    <>
      <JsonLd
        data={{
          "@type": "TechArticle",
          headline: title,
          description: fill(g.description),
          url: `${APP_URL}${path}`,
          image: `${APP_URL}${DEFAULT_OG_IMAGE.url}`,
          about: g.about.map((name) => ({ "@type": "Thing", name })),
          citation: g.sources,
          datePublished: g.published,
          // The later of an edit to the text and a move in the {{stat}} counts, as the sitemap dates it.
          dateModified: new Date(Math.max(new Date(g.updated).getTime(), (contentChangedAt ?? 0) * 1000)).toISOString(),
          author: AUTHOR_JSON_LD,
          publisher: { "@type": "Organization", name: APP_NAME, url: APP_URL },
        }}
      />
      <PageHeader
        crumbs={{ parents: [GUIDE_CRUMB], current: { name: g.name, path } }}
        title={title}
        lead={<CodeText text={fill(g.lead)} />}
      />

      <div className="flex flex-col gap-3.5">
        {g.sections.map((s) => (
          <div key={s.id} id={s.id} className="scroll-mt-24">
            <Panel tone={s.tone}>
              <PanelHeading tone={s.tone}>{s.heading}</PanelHeading>
              <GuideBlocks blocks={s.blocks} fill={fill} examples={(b) => examplesFor(rows, b)} />
            </Panel>
          </div>
        ))}

        {g.faq && g.faq.length > 0 && (
          <Panel>
            <PanelHeading>Questions people ask</PanelHeading>
            <FaqList
              items={g.faq.map((f) => ({
                key: f.q,
                q: <CodeText text={fill(f.q)} />,
                a: <CodeText text={fill(f.a)} />,
              }))}
            />
          </Panel>
        )}
      </div>

      {g.sources.length > 0 && (
        <p className="mt-5 mb-0 text-[13px] text-muted">
          From the docs:{" "}
          {distinctSourceLabels(g.sources).map((label, i) => (
            <span key={g.sources[i]}>
              {i > 0 && " · "}
              <ExternalLink href={g.sources[i]} title={g.sources[i]}>
                {label}
              </ExternalLink>
            </span>
          ))}
        </p>
      )}
      <p className="mt-2 mb-0 text-[13px] text-muted">
        {g.related.map((r, i) => (
          <span key={r.href}>
            {i > 0 && " · "}
            <Link href={r.href} className={LINK}>
              {r.label}
            </Link>
          </span>
        ))}
      </p>
    </>
  );
}

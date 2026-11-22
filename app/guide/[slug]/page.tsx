import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CodeText } from "@/components/CodeText";
import { ExternalLink } from "@/components/ExternalLink";
import { FaqSection } from "@/components/FaqSection";
import { GuideBlocks } from "@/components/GuideBlocks";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { LINK } from "@/components/link-class";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { plainText } from "@/lib/agents-faq";
import { languageExampleLinks } from "@/lib/agents-md-example-links";
import type { ExampleRow } from "@/lib/agents-md-examples";
import { AUTHOR_JSON_LD } from "@/lib/author";
import { GUIDES, guideBySlug } from "@/lib/guides";
import { guideModified } from "@/lib/guides/modified";
import { fillStats, getGuideStats } from "@/lib/guides/stats";
import type { Guide, GuideBlock } from "@/lib/guides/types";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { distinctSourceLabels } from "@/lib/leaderboard-model-panel";
import { GUIDE_CRUMB, guidePath } from "@/lib/utils/guide-path";
import { ogImage } from "@/lib/utils/og-image";
import { pageTitle } from "@/lib/utils/page-title";
import { APP_NAME, APP_URL, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

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

  const image = ogImage(path, title);
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: path },
    twitter: { ...TWITTER_DEFAULTS, images: [image], title, description },
    openGraph: { ...OG_DEFAULTS, images: [image], title, description, url: path, type: "article" },
  };
}

const baseName = (file: string) => file.split("/").pop()?.toLowerCase();

function examplesFor(rows: ExampleRow[], b: Extract<GuideBlock, { kind: "examples" }>): ExampleRow[] {
  return rows
    .filter((r) => baseName(r.file) === b.file.toLowerCase() && (b.language == null || r.language === b.language))
    .slice(0, b.limit);
}

// HowTo from the steps the page shows, so the markup can't list a step the reader doesn't see.
function howToJsonLd(g: Guide, fill: (t: string) => string): Record<string, unknown> | null {
  const section = g.sections.find((s) => s.howTo);
  const list = section?.blocks.find((b) => b.kind === "list" && b.ordered);
  if (!section || list?.kind !== "list") return null;
  return {
    "@type": "HowTo",
    name: section.heading,
    url: `${APP_URL}${guidePath(g.slug)}#${section.id}`,
    step: list.items.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text: plainText(fill(text)) })),
  };
}

export default async function GuidePage({ params }: { params: Params }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();

  const stats = getGuideStats();
  const fill = (text: string) => fillStats(text, stats);
  const rows = getAgentsMdExamples().rows;
  const path = guidePath(g.slug);
  const modified = guideModified(g);
  const howTo = howToJsonLd(g, fill);
  const title = fill(g.title);

  return (
    <>
      <JsonLd
        data={{
          "@type": "TechArticle",
          headline: title,
          description: fill(g.description),
          url: `${APP_URL}${path}`,
          image: `${APP_URL}/og${path}`,
          about: g.about.map((name) => ({ "@type": "Thing", name })),
          citation: g.sources,
          datePublished: g.published,
          dateModified: modified,
          author: AUTHOR_JSON_LD,
          publisher: { "@type": "Organization", name: APP_NAME, url: APP_URL },
        }}
      />
      {howTo && <JsonLd data={howTo} />}
      <PageHeader
        crumbs={{ parents: [GUIDE_CRUMB], current: { name: g.name, path } }}
        title={title}
        lead={<CodeText text={fill(g.lead)} />}
        updated={modified}
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
          <FaqSection heading="Questions people ask" items={g.faq.map((f) => ({ q: fill(f.q), a: fill(f.a) }))} />
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
      {g.languageExamples && (
        <p className="mt-2 mb-0 text-[13px] text-muted">
          AGENTS.md examples by language:{" "}
          {languageExampleLinks(getAgentsMdExamples()).map((l, i) => (
            <span key={l.href}>
              {i > 0 && " · "}
              <IntentLink href={l.href} className={LINK}>
                {l.label}
              </IntentLink>
            </span>
          ))}
        </p>
      )}
      <p className="mt-2 mb-0 text-[13px] text-muted">
        {g.related.map((r, i) => (
          <span key={r.href}>
            {i > 0 && " · "}
            <IntentLink href={r.href} className={LINK}>
              {r.label}
            </IntentLink>
          </span>
        ))}
      </p>
    </>
  );
}

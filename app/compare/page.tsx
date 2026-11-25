import type { Metadata } from "next";

import { ComparePairsView } from "@/components/ComparePairsView";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { LINK } from "@/components/link-class";
import { PAGE_LEAD, PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { pairSplit } from "@/lib/agent-scores";
import { getAgentLanguages, getScoredRepos } from "@/lib/agent-scores-data";
import { AUTHOR_JSON_LD } from "@/lib/author";
import { COMPARE_HUB_DESCRIPTION, compareHubTitle } from "@/lib/compare-copy";
import { COMPARE_PAIRS } from "@/lib/compare-pairs";
import { compareHubModified } from "@/lib/page-dates";
import { PUBLISHER_JSON_LD } from "@/lib/site-json-ld";
import { COMPARE_PATH, comparePath } from "@/lib/utils/compare-path";
import { hubAgentsPath } from "@/lib/utils/language";
import { pageTitle } from "@/lib/utils/page-title";
import { APP_URL, DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

export function generateMetadata(): Metadata {
  const title = compareHubTitle(getScoredRepos().length);
  const description = COMPARE_HUB_DESCRIPTION;
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: COMPARE_PATH },
    twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description },
    openGraph: { ...OG_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description, url: COMPARE_PATH, type: "website" },
  };
}

export default function CompareHubPage() {
  const rows = getScoredRepos();
  const title = compareHubTitle(rows.length);
  const pairs = COMPARE_PAIRS.map((p) => ({ ...p, stats: pairSplit(rows, p.a, p.b) }));
  const languages = getAgentLanguages();
  const modified = compareHubModified();

  return (
    <>
      <JsonLd
        data={{
          "@type": "CollectionPage",
          name: title,
          description: COMPARE_HUB_DESCRIPTION,
          url: `${APP_URL}${COMPARE_PATH}`,
          hasPart: pairs.map((p) => ({ "@type": "TechArticle", url: `${APP_URL}${comparePath(p.slug)}` })),
          datePublished: "2026-11-16",
          dateModified: modified,
          author: AUTHOR_JSON_LD,
          publisher: PUBLISHER_JSON_LD,
        }}
      />
      <PageHeader
        crumbs={{ current: { name: "Compare agents", path: COMPARE_PATH } }}
        title={title}
        updated={modified}
        lead={`Each of the ${rows.length} repos on the board has a score for every agent. Each comparison puts two side by side: averages, files each reads, checks each weighs, and repos that favour one.`}
      >
        <p className={`mt-2.5 ${PAGE_LEAD}`}>
          The scores measure how well a repo is set up for an agent, not which agent writes better code.
        </p>
      </PageHeader>

      <Panel>
        <PanelHeading>Which pair do you want to compare?</PanelHeading>
        <ComparePairsView
          pairs={pairs.map(({ slug, a, b, stats }) => ({
            slug,
            a,
            b,
            // Rounded as shown, so the payload carries no float tail.
            avgA: Number(stats.avgA.toFixed(1)),
            avgB: Number(stats.avgB.toFixed(1)),
            aHigher: stats.aHigher,
            bHigher: stats.bHigher,
          }))}
        />
        <p className="mt-3 mb-0 text-[13px] text-muted">
          &ldquo;Higher for each&rdquo; counts the repos that score higher for the first agent, then the second; the
          rest tie.
        </p>
      </Panel>

      {languages.length > 0 && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>Which agent are repos in my language set up for?</PanelHeading>
            <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-1.5 p-0 text-[14.5px]">
              {languages.map((l) => (
                <li key={l.slug}>
                  <IntentLink href={hubAgentsPath(l.slug)} className="arrow-link">
                    {l.label} →
                  </IntentLink>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      <p className="mt-5 mb-0 text-[13px] text-muted">
        <IntentLink href="/agents" className={LINK}>
          Which files each agent reads
        </IntentLink>
        {" · "}
        <IntentLink href="/methodology" className={LINK}>
          How the scores work
        </IntentLink>
      </p>
    </>
  );
}

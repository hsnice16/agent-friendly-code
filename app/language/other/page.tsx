import type { Metadata } from "next";

import { CheckRepoList } from "@/components/CheckRepoList";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { LANGUAGE_HUB_MIN_REPOS } from "@/lib/constants/scoring";
import { listLeaderboardOverall } from "@/lib/db";
import { OTHER_LANGUAGES_TITLE, otherLanguagesDescription } from "@/lib/page-meta";
import { OTHER_LANGUAGES_PATH, otherLanguageGroups } from "@/lib/utils/language";
import { pageTitle } from "@/lib/utils/page-title";
import { repoPath } from "@/lib/utils/repo-path";
import { APP_URL, DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const groups = () => otherLanguageGroups(listLeaderboardOverall());

export function generateMetadata(): Metadata {
  const title = OTHER_LANGUAGES_TITLE;
  const description = otherLanguagesDescription(groups());

  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: OTHER_LANGUAGES_PATH },
    twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description },
    openGraph: {
      ...OG_DEFAULTS,
      images: [DEFAULT_OG_IMAGE],
      title,
      description,
      url: OTHER_LANGUAGES_PATH,
      type: "website",
    },
  };
}

export default function OtherLanguagesPage() {
  const all = groups();
  const rows = all.flatMap((g) => g.rows);

  return (
    <>
      <JsonLd
        data={{
          "@type": "ItemList",
          name: OTHER_LANGUAGES_TITLE,
          numberOfItems: rows.length,
          itemListElement: rows.map((r, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${r.owner}/${r.name}`,
            url: `${APP_URL}${repoPath(r)}`,
          })),
        }}
      />

      <PageHeader
        crumbs={{
          parents: [{ name: "Languages", path: "/language" }],
          current: { name: "Other languages", path: OTHER_LANGUAGES_PATH },
        }}
        title={OTHER_LANGUAGES_TITLE}
        lead={`${rows.length} repos in languages with fewer than ${LANGUAGE_HUB_MIN_REPOS} repos here, or with none detected. Grouped by language, highest score first.`}
      />

      <div className="flex flex-col gap-3.5">
        {all.map((g) => (
          <div key={g.slug} id={g.slug} className="scroll-mt-20">
            <Panel>
              <PanelHeading>
                {g.label} ({g.rows.length})
              </PanelHeading>
              <CheckRepoList rows={g.rows} />
            </Panel>
          </div>
        ))}
      </div>
    </>
  );
}

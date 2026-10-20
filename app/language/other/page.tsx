import type { Metadata } from "next";
import Link from "next/link";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { CheckRepoList } from "@/components/CheckRepoList";
import { JsonLd } from "@/components/JsonLd";
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
      <BreadcrumbJsonLd
        parent={{ name: "Languages", path: "/language" }}
        current={{ name: "Other languages", path: OTHER_LANGUAGES_PATH }}
      />
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

      <Link
        href="/language"
        className="my-5 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink hover:no-underline"
      >
        ← all languages
      </Link>

      <section className="mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">{OTHER_LANGUAGES_TITLE}</h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          {rows.length} repos in languages with fewer than {LANGUAGE_HUB_MIN_REPOS} repos here, or with none detected.
          Grouped by language, highest score first.
        </p>
      </section>

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

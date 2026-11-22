import type { Metadata } from "next";

import { IntentLink } from "@/components/IntentLink";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { ScoreNumber } from "@/components/ScoreNumber";
import { LANGUAGE_HUB_MIN_REPOS } from "@/lib/constants/scoring";
import { listLeaderboardOverall } from "@/lib/db";
import { getLanguageGroups } from "@/lib/language-hubs";
import { PAGE_COPY, staticPageMetadata } from "@/lib/page-meta";
import { getTopicGroups } from "@/lib/topic-pages";
import { TOPICS_PATH } from "@/lib/topics";
import { averageScore, hubPath, isHub, OTHER_LANGUAGES_PATH, otherLanguageGroups } from "@/lib/utils/language";

export const metadata: Metadata = staticPageMetadata("/language");

const LINK_CLASS = "dim-link";

export default function LanguagesPage() {
  const hubs = getLanguageGroups().filter(isHub);
  const other = otherLanguageGroups(listLeaderboardOverall());
  const otherCount = other.reduce((n, g) => n + g.rows.length, 0);
  const hasTopics = getTopicGroups().length > 0;

  return (
    <>
      <PageHeader
        crumbs={{ current: { name: "Languages", path: "/language" } }}
        title={PAGE_COPY["/language"].title}
        lead={
          <>
            The leaderboard by language: each page ranks its repos and shows the checks they most often miss.
            {hasTopics && (
              <>
                {" "}
                Or browse by{" "}
                <IntentLink href={TOPICS_PATH} className="prose-link">
                  topics
                </IntentLink>
                .
              </>
            )}
          </>
        }
      />

      <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2 md:grid-cols-3">
        {hubs.map((g) => (
          <li key={g.slug} className="relative tile">
            <div className="flex items-baseline justify-between gap-2">
              <IntentLink href={hubPath(g.slug)} className="font-medium ink-link cover-link">
                {g.label}
              </IntentLink>
              <ScoreNumber score={averageScore(g.rows)} size="sm" />
            </div>
            <div className="mt-1 text-[12px] text-muted">{g.rows.length} repos · average score</div>
          </li>
        ))}
      </ul>

      {other.length > 0 && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>Other languages</PanelHeading>
            <p className="m-0 mb-2.5 text-[14px] text-ink-dim">
              <IntentLink href={OTHER_LANGUAGES_PATH} className="font-medium ink-link">
                {otherCount} repos in other languages
              </IntentLink>
              : languages with fewer than {LANGUAGE_HUB_MIN_REPOS} repos here, or none detected.
            </p>
            <p className="m-0 flex flex-wrap gap-x-3 gap-y-1 text-[13.5px]">
              {other.map((g) => (
                <IntentLink key={g.slug} href={`${OTHER_LANGUAGES_PATH}#${g.slug}`} className={LINK_CLASS}>
                  {g.label} ({g.rows.length})
                </IntentLink>
              ))}
            </p>
          </Panel>
        </div>
      )}
    </>
  );
}

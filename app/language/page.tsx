import type { Metadata } from "next";
import Link from "next/link";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
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

const LINK_CLASS = "text-ink-dim hover:text-ink-soft";

export default function LanguagesPage() {
  const hubs = getLanguageGroups().filter(isHub);
  const other = otherLanguageGroups(listLeaderboardOverall());
  const otherCount = other.reduce((n, g) => n + g.rows.length, 0);
  const hasTopics = getTopicGroups().length > 0;

  return (
    <>
      <BreadcrumbJsonLd current={{ name: "Languages", path: "/language" }} />

      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">{PAGE_COPY["/language"].title}</h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          The leaderboard, one language at a time. Each page ranks that language&apos;s repos and shows the checks they
          most often miss.
          {hasTopics && (
            <>
              {" "}
              To browse by what the code does instead, see{" "}
              <Link href={TOPICS_PATH} className="text-ink hover:text-ink-soft">
                topics
              </Link>
              .
            </>
          )}
        </p>
      </section>

      <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2 md:grid-cols-3">
        {hubs.map((g) => (
          <li key={g.slug} className="relative rounded-lg border border-line bg-surface px-4 py-3.5">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={hubPath(g.slug)}
                className="font-medium text-ink hover:text-ink-soft before:absolute before:inset-0 before:content-['']"
              >
                {g.label}
              </Link>
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
              <Link href={OTHER_LANGUAGES_PATH} className="font-medium text-ink hover:text-ink-soft">
                {otherCount} repos in other languages
              </Link>
              : languages with fewer than {LANGUAGE_HUB_MIN_REPOS} repos on the leaderboard, and repos whose language
              was not detected.
            </p>
            <p className="m-0 flex flex-wrap gap-x-3 gap-y-1 text-[13.5px]">
              {other.map((g) => (
                <Link key={g.slug} href={`${OTHER_LANGUAGES_PATH}#${g.slug}`} className={LINK_CLASS}>
                  {g.label} ({g.rows.length})
                </Link>
              ))}
            </p>
          </Panel>
        </div>
      )}
    </>
  );
}

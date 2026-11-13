import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { getLanguageGroups } from "@/lib/language-hubs";
import { PAGE_COPY, staticPageMetadata } from "@/lib/page-meta";
import { getTopicGroups } from "@/lib/topic-pages";
import { TOPIC_PAGE_MIN_REPOS, TOPICS_PATH, topicPath } from "@/lib/topics";
import { hubPath, isHub } from "@/lib/utils/language";

// With no topic pages, an empty index is not worth a search result.
export function generateMetadata(): Metadata {
  const meta = staticPageMetadata(TOPICS_PATH);
  return getTopicGroups().length > 0 ? meta : { ...meta, robots: { index: false, follow: true } };
}

const LINK_CLASS = "text-ink-dim hover:text-ink-soft";

export default function TopicsPage() {
  const topics = getTopicGroups();
  const hubs = getLanguageGroups().filter(isHub);

  return (
    <>
      <PageHeader
        crumbs={{ current: { name: "Topics", path: TOPICS_PATH } }}
        title={PAGE_COPY[TOPICS_PATH].title}
        lead={`The leaderboard by the topics owners tag their repos with. A topic gets a page once ${TOPIC_PAGE_MIN_REPOS} repos share it.`}
      />

      {topics.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2 md:grid-cols-3">
          {topics.map((t) => (
            <li key={t.slug} className="relative flex items-baseline justify-between gap-2 tile">
              <Link href={topicPath(t.slug)} className="font-medium ink-link cover-link">
                {/* Labels stay lowercase for use mid-sentence; a tile starts one. */}
                <span>{t.label}</span>
              </Link>
              <span className="text-[12px] text-muted">{t.rows.length} repos</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-[14.5px] text-muted">No topic has enough repos for a page yet.</p>
      )}

      {hubs.length > 0 && (
        <nav
          aria-label="Browse by language"
          className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-muted"
        >
          <span>By language:</span>
          {hubs.map((g) => (
            <Link key={g.slug} href={hubPath(g.slug)} className={LINK_CLASS}>
              {g.label}
            </Link>
          ))}
          <Link href="/language" className="arrow-link">
            All languages →
          </Link>
        </nav>
      )}
    </>
  );
}

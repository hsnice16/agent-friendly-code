import type { MetadataRoute } from "next";

import { LATEST_RELEASE_DATE } from "@/lib/changelog";
import { getLeaderboardStats, listLeaderboardOverall } from "@/lib/db";
import { getLanguageGroups } from "@/lib/language-hubs";
import { SIGNALS } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { getTopicGroups } from "@/lib/topic-pages";
import { TOPICS_PATH, topicPath } from "@/lib/topics";
import { checkPath } from "@/lib/utils/check-path";
import { hubPath, isHub, OTHER_LANGUAGES_PATH, otherLanguageGroups } from "@/lib/utils/language";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { repoPath } from "@/lib/utils/repo-path";
import { APP_URL } from "@/lib/version";

const LEGAL_LAST_UPDATED = new Date("2026-10-10");

function newest(rows: { content_changed_at: number | null }[]): Date | undefined {
  const changed = Math.max(0, ...rows.map((r) => r.content_changed_at ?? 0));
  return changed > 0 ? new Date(changed * 1000) : undefined;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Only a score or badge change moves lastmod: a date that moves on every crawl
  // or rescore teaches Google to ignore it.
  const stats = getLeaderboardStats();
  const contentChanged = stats.contentChangedAt != null ? new Date(stats.contentChangedAt * 1000) : undefined;
  // Methodology and changelog change only in a release; no other static page has a dated source.
  const released = new Date(LATEST_RELEASE_DATE);
  const board = listLeaderboardOverall();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      priority: 1,
      url: APP_URL,
      lastModified: contentChanged,
      changeFrequency: "daily",
    },
    {
      priority: 0.9,
      url: `${APP_URL}/score`,
      lastModified: contentChanged,
      changeFrequency: "weekly",
    },
    {
      priority: 0.8,
      url: `${APP_URL}/package`,
      lastModified: contentChanged,
      changeFrequency: "weekly",
    },
    {
      priority: 0.8,
      url: `${APP_URL}/action`,
      changeFrequency: "monthly",
    },
    {
      priority: 0.8,
      url: `${APP_URL}/skill`,
      changeFrequency: "monthly",
    },
    {
      priority: 0.7,
      changeFrequency: "monthly",
      url: `${APP_URL}/methodology`,
      lastModified: released,
    },
    {
      priority: 0.7,
      url: `${APP_URL}/language`,
      lastModified: contentChanged,
      changeFrequency: "weekly",
    },
    {
      priority: 0.8,
      url: `${APP_URL}/check`,
      lastModified: contentChanged,
      changeFrequency: "weekly",
    },
    {
      priority: 0.5,
      url: `${APP_URL}/about`,
      changeFrequency: "monthly",
    },
    {
      priority: 0.3,
      changeFrequency: "yearly",
      url: `${APP_URL}/privacy`,
      lastModified: LEGAL_LAST_UPDATED,
    },
    {
      priority: 0.3,
      url: `${APP_URL}/terms`,
      changeFrequency: "yearly",
      lastModified: LEGAL_LAST_UPDATED,
    },
    {
      priority: 0.6,
      changeFrequency: "weekly",
      url: `${APP_URL}/roadmap`,
    },
    {
      priority: 0.6,
      changeFrequency: "weekly",
      url: `${APP_URL}/changelog`,
      lastModified: released,
    },
    {
      priority: 0.8,
      changeFrequency: "weekly",
      url: `${APP_URL}${checkPath("agents_md")}/examples`,
      lastModified: contentChanged,
    },
    {
      priority: 0.6,
      changeFrequency: "weekly",
      url: `${APP_URL}${OTHER_LANGUAGES_PATH}`,
      lastModified: newest(otherLanguageGroups(board).flatMap((g) => g.rows)),
    },
  ];

  const repoRoutes: MetadataRoute.Sitemap = board.map((r) => ({
    changeFrequency: "weekly",
    url: `${APP_URL}${repoPath(r)}`,
    lastModified: r.content_changed_at != null ? new Date(r.content_changed_at * 1000) : undefined,
    priority: r.score != null ? Math.round((0.3 + (r.score / 100) * 0.6) * 10) / 10 : 0.4,
  }));

  const hubRoutes: MetadataRoute.Sitemap = getLanguageGroups()
    .filter(isHub)
    .map((g) => ({
      priority: 0.8,
      changeFrequency: "weekly",
      url: `${APP_URL}${hubPath(g.slug)}`,
      lastModified: newest(g.rows),
    }));

  const topics = getTopicGroups();
  // Empty until a rescore stores topics; /topics is noindex until then.
  const topicRoutes: MetadataRoute.Sitemap =
    topics.length === 0
      ? []
      : [
          {
            priority: 0.6,
            changeFrequency: "weekly",
            url: `${APP_URL}${TOPICS_PATH}`,
            lastModified: newest(topics.flatMap((t) => t.rows)),
          },
          ...topics.map((t) => ({
            priority: 0.7,
            changeFrequency: "weekly" as const,
            url: `${APP_URL}${topicPath(t.slug)}`,
            lastModified: newest(t.rows),
          })),
        ];

  const modelRoutes: MetadataRoute.Sitemap = MODELS.map((m) => ({
    priority: 0.8,
    changeFrequency: "daily",
    lastModified: contentChanged,
    url: `${APP_URL}${modelPath(m.id)}`,
  }));

  const checkRoutes: MetadataRoute.Sitemap = SIGNALS.map((s) => ({
    priority: 0.8,
    changeFrequency: "weekly",
    lastModified: contentChanged,
    url: `${APP_URL}${checkPath(s.id)}`,
  }));

  // No /package/<registry>/<name>: those pages are noindex (see their page.tsx).
  return [...staticRoutes, ...checkRoutes, ...modelRoutes, ...hubRoutes, ...topicRoutes, ...repoRoutes];
}

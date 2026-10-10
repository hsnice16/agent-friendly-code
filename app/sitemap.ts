import type { MetadataRoute } from "next";

import { REGISTRIES } from "@/lib/clients/registries";
import { getLeaderboardStats, getTopPackagesByRegistry, listLeaderboardOverall } from "@/lib/db";
import { getLanguageGroups } from "@/lib/language-hubs";
import { hubPath, isHub } from "@/lib/utils/language";
import { repoPath } from "@/lib/utils/repo-path";
import { APP_URL } from "@/lib/version";

const SITEMAP_PACKAGE_LIMIT_PER_REGISTRY = 10000;
const LEGAL_LAST_UPDATED = new Date("2026-10-10");

export default function sitemap(): MetadataRoute.Sitemap {
  // Only a score or badge change moves lastmod: a date that moves on every crawl
  // or rescore teaches Google to ignore it.
  const stats = getLeaderboardStats();
  const contentChanged = stats.contentChangedAt != null ? new Date(stats.contentChangedAt * 1000) : undefined;

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
    },
    {
      priority: 0.7,
      url: `${APP_URL}/language`,
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
    },
    {
      priority: 0.4,
      lastModified: contentChanged,
      changeFrequency: "weekly",
      url: `${APP_URL}/llms.txt`,
    },
  ];

  const repoRoutes: MetadataRoute.Sitemap = listLeaderboardOverall().map((r) => ({
    changeFrequency: "weekly",
    url: `${APP_URL}${repoPath(r)}`,
    lastModified: r.content_changed_at != null ? new Date(r.content_changed_at * 1000) : undefined,
    priority: r.score != null ? Math.round((0.3 + (r.score / 100) * 0.6) * 10) / 10 : 0.4,
  }));

  const hubRoutes: MetadataRoute.Sitemap = getLanguageGroups()
    .filter(isHub)
    .map((g) => {
      const changed = Math.max(...g.rows.map((r) => r.content_changed_at ?? 0));
      return {
        priority: 0.8,
        changeFrequency: "weekly",
        url: `${APP_URL}${hubPath(g.slug)}`,
        lastModified: changed > 0 ? new Date(changed * 1000) : undefined,
      };
    });

  const packageRoutes: MetadataRoute.Sitemap = REGISTRIES.flatMap((registry) =>
    getTopPackagesByRegistry(registry, SITEMAP_PACKAGE_LIMIT_PER_REGISTRY).map((p) => ({
      lastModified: p.contentChangedAt != null ? new Date(p.contentChangedAt * 1000) : undefined,
      changeFrequency: "weekly",
      url: `${APP_URL}/package/${registry}/${p.name}`,
      priority: Math.round((0.4 + (p.score / 100) * 0.4) * 10) / 10,
    })),
  );

  return [...staticRoutes, ...hubRoutes, ...repoRoutes, ...packageRoutes];
}

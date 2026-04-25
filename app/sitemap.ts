import type { MetadataRoute } from "next";

import { getLeaderboardStats, listLeaderboardOverall } from "@/lib/db";
import { APP_URL } from "@/lib/version";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const stats = getLeaderboardStats();
  const lastScored = stats.lastScoredAt != null ? new Date(stats.lastScoredAt * 1000) : now;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${APP_URL}/`,
      priority: 1,
      lastModified: lastScored,
      changeFrequency: "daily",
    },
    {
      url: `${APP_URL}/package`,
      priority: 0.8,
      lastModified: lastScored,
      changeFrequency: "weekly",
    },
    {
      url: `${APP_URL}/methodology`,
      priority: 0.7,
      lastModified: now,
      changeFrequency: "monthly",
    },
    {
      url: `${APP_URL}/roadmap`,
      priority: 0.6,
      lastModified: now,
      changeFrequency: "weekly",
    },
    {
      url: `${APP_URL}/changelog`,
      priority: 0.6,
      lastModified: now,
      changeFrequency: "weekly",
    },
  ];

  const repoRoutes: MetadataRoute.Sitemap = listLeaderboardOverall().map((r) => ({
    url: `${APP_URL}/repo/${r.id}`,
    priority: 0.6,
    changeFrequency: "weekly",
    lastModified: r.last_scored_at != null ? new Date(r.last_scored_at * 1000) : now,
  }));

  return [...staticRoutes, ...repoRoutes];
}

import type { MetadataRoute } from "next";

import { REGISTRIES } from "@/lib/clients/registries";
import { getLeaderboardStats, getTopPackagesByRegistry, listLeaderboardOverall } from "@/lib/db";
import { APP_URL } from "@/lib/version";

const SITEMAP_PACKAGE_LIMIT_PER_REGISTRY = 10000;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const stats = getLeaderboardStats();
  const lastScored = stats.lastScoredAt != null ? new Date(stats.lastScoredAt * 1000) : now;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      priority: 1,
      url: `${APP_URL}/`,
      lastModified: lastScored,
      changeFrequency: "daily",
    },
    {
      priority: 0.8,
      url: `${APP_URL}/package`,
      lastModified: lastScored,
      changeFrequency: "weekly",
    },
    {
      priority: 0.8,
      lastModified: now,
      url: `${APP_URL}/action`,
      changeFrequency: "monthly",
    },
    {
      priority: 0.8,
      lastModified: now,
      url: `${APP_URL}/skill`,
      changeFrequency: "monthly",
    },
    {
      priority: 0.7,
      lastModified: now,
      changeFrequency: "monthly",
      url: `${APP_URL}/methodology`,
    },
    {
      priority: 0.5,
      lastModified: now,
      changeFrequency: "monthly",
      url: `${APP_URL}/about`,
    },
    {
      priority: 0.6,
      lastModified: now,
      changeFrequency: "weekly",
      url: `${APP_URL}/roadmap`,
    },
    {
      priority: 0.6,
      lastModified: now,
      changeFrequency: "weekly",
      url: `${APP_URL}/changelog`,
    },
  ];

  const repoRoutes: MetadataRoute.Sitemap = listLeaderboardOverall().map((r) => ({
    changeFrequency: "weekly",
    url: `${APP_URL}/repo/${r.id}`,
    lastModified: r.last_scored_at != null ? new Date(r.last_scored_at * 1000) : now,
    priority: r.score != null ? Math.round((0.3 + (r.score / 100) * 0.6) * 10) / 10 : 0.4,
  }));

  const packageRoutes: MetadataRoute.Sitemap = REGISTRIES.flatMap((registry) =>
    getTopPackagesByRegistry(registry, SITEMAP_PACKAGE_LIMIT_PER_REGISTRY).map((p) => ({
      lastModified: lastScored,
      changeFrequency: "weekly",
      url: `${APP_URL}/package/${registry}/${p.name}`,
      priority: Math.round((0.4 + (p.score / 100) * 0.4) * 10) / 10,
    })),
  );

  return [...staticRoutes, ...repoRoutes, ...packageRoutes];
}

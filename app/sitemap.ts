import type { MetadataRoute } from "next";

import { listLeaderboardOverall } from "@/lib/db";
import { APP_URL } from "@/lib/version";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ["/", "/methodology", "/roadmap", "/changelog"].map((path) => ({
    lastModified: now,
    url: `${APP_URL}${path}`,
    priority: path === "/" ? 1 : 0.8,
    changeFrequency: "weekly" as const,
  }));

  const repoRoutes = listLeaderboardOverall().map((r) => ({
    priority: 0.6,
    lastModified: now,
    url: `${APP_URL}/repo/${r.id}`,
    changeFrequency: "weekly" as const,
  }));

  return [...staticRoutes, ...repoRoutes];
}

import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/version";

export default function robots(): MetadataRoute.Robots {
  return {
    sitemap: `${APP_URL}/sitemap.xml`,
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
  };
}

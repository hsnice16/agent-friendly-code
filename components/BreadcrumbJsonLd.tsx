import { APP_URL } from "@/lib/version";

import { JsonLd } from "./JsonLd";

export type Crumb = { name: string; path: string };

export function breadcrumbTrail(current: Crumb, parents: Crumb[] = []): Crumb[] {
  return [{ name: "Home", path: "/" }, ...parents, current];
}

export function BreadcrumbJsonLd({ current, parent }: { current: Crumb; parent?: Crumb | Crumb[] }) {
  const trail = breadcrumbTrail(current, parent == null ? [] : [parent].flat());

  return (
    <JsonLd
      data={{
        "@type": "BreadcrumbList",
        itemListElement: trail.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: `${APP_URL}${c.path}`,
        })),
      }}
    />
  );
}

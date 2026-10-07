import { APP_URL } from "@/lib/version";

type Crumb = { name: string; path: string };

export function BreadcrumbJsonLd({ current, parent }: { current: Crumb; parent?: Crumb }) {
  const trail = [{ name: "Home", path: "/" }, ...(parent ? [parent] : []), current];
  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${APP_URL}${c.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: server-built JSON-LD; `<` is escaped
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(json).replace(/</g, "\\u003c"),
      }}
    />
  );
}

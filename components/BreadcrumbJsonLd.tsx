import { APP_URL } from "@/lib/version";

export function BreadcrumbJsonLd({ current }: { current: { name: string; path: string } }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${APP_URL}/` },
      { "@type": "ListItem", position: 2, name: current.name, item: `${APP_URL}${current.path}` },
    ],
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

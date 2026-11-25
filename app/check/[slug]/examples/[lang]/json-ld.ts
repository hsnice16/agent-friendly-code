import { type LanguageExamples, languageExamplesDescription, languageExamplesTitle } from "@/lib/agents-md-examples";
import {
  type FrameworkExamples,
  frameworkExamplesDescription,
  frameworkExamplesTitle,
} from "@/lib/agents-md-frameworks";
import { AUTHOR_JSON_LD } from "@/lib/author";
import { frameworkModified, languageExamplesModified } from "@/lib/page-dates";
import { PUBLISHER_JSON_LD, WEBSITE_JSON_LD } from "@/lib/site-json-ld";
import { frameworkExamplesPath, languageExamplesPath } from "@/lib/utils/check-path";
import { ogImage } from "@/lib/utils/og-image";
import { repoPath } from "@/lib/utils/repo-path";
import { APP_URL } from "@/lib/version";

export function frameworkJsonLd(f: FrameworkExamples) {
  const path = frameworkExamplesPath(f.guide.slug);
  const title = frameworkExamplesTitle(f);
  return {
    "@type": "TechArticle",
    headline: title,
    description: frameworkExamplesDescription(f),
    url: `${APP_URL}${path}`,
    image: `${APP_URL}${ogImage(path, title).url}`,
    about: [
      { "@type": "Thing", name: "AGENTS.md" },
      { "@type": "Thing", name: f.guide.label },
    ],
    citation: f.guide.sources,
    datePublished: f.guide.published,
    dateModified: frameworkModified(f),
    author: AUTHOR_JSON_LD,
    publisher: PUBLISHER_JSON_LD,
    mentions: f.rows.map((r) => ({
      "@type": "SoftwareSourceCode",
      name: `${r.owner}/${r.name}`,
      url: `${APP_URL}${repoPath(r)}`,
    })),
  };
}

export function languageJsonLd(lang: LanguageExamples) {
  const changed = languageExamplesModified(lang);
  const url = `${APP_URL}${languageExamplesPath(lang.slug)}`;
  return {
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        url,
        name: languageExamplesTitle(lang),
        description: languageExamplesDescription(lang),
        about: [
          { "@type": "Thing", name: "AGENTS.md" },
          { "@type": "ComputerLanguage", name: lang.label },
        ],
        ...(lang.guide ? { citation: lang.guide.sources } : {}),
        isPartOf: WEBSITE_JSON_LD,
        ...(changed ? { dateModified: changed } : {}),
        mainEntity: {
          "@type": "ItemList",
          name: `${lang.label} repos with an AGENTS.md or CLAUDE.md`,
          numberOfItems: lang.rows.length,
          itemListElement: lang.rows.map((r, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${r.owner}/${r.name}`,
            url: `${APP_URL}${repoPath(r)}`,
          })),
        },
      },
    ],
  };
}

import { type LanguageExamples, languageExamplesDescription, languageExamplesTitle } from "@/lib/agents-md-examples";
import {
  type FrameworkExamples,
  frameworkExamplesDescription,
  frameworkExamplesTitle,
} from "@/lib/agents-md-frameworks";
import { AUTHOR_JSON_LD } from "@/lib/author";
import { frameworkModified, rowsModified } from "@/lib/page-dates";
import { WEBSITE_JSON_LD } from "@/lib/site-json-ld";
import { frameworkExamplesPath, languageExamplesPath } from "@/lib/utils/check-path";
import { repoPath } from "@/lib/utils/repo-path";
import { APP_NAME, APP_URL } from "@/lib/version";

export function frameworkJsonLd(f: FrameworkExamples) {
  const url = `${APP_URL}${frameworkExamplesPath(f.guide.slug)}`;
  return {
    "@type": "TechArticle",
    headline: frameworkExamplesTitle(f),
    description: frameworkExamplesDescription(f),
    url,
    image: `${APP_URL}/og${frameworkExamplesPath(f.guide.slug)}`,
    about: [
      { "@type": "Thing", name: "AGENTS.md" },
      { "@type": "SoftwareApplication", name: f.guide.label },
    ],
    citation: f.guide.sources,
    dateModified: frameworkModified(f),
    author: AUTHOR_JSON_LD,
    publisher: { "@type": "Organization", name: APP_NAME, url: APP_URL },
    mentions: f.rows.map((r) => ({
      "@type": "SoftwareSourceCode",
      name: `${r.owner}/${r.name}`,
      url: `${APP_URL}${repoPath(r)}`,
    })),
  };
}

export function languageJsonLd(lang: LanguageExamples) {
  const changed = rowsModified(lang.rows);
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

import { notFound } from "next/navigation";

import { examplesByLanguage, languageExamplesTitle } from "@/lib/agents-md-examples";
import { examplesByFramework, frameworkExamplesTitle } from "@/lib/agents-md-frameworks";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { pageCard } from "@/lib/og-card";
import { checkSlug, frameworkExamplesPath, languageExamplesPath } from "@/lib/utils/check-path";

const SIGNAL_ID = "agents_md";

// Prerendered: rendering a card on request costs function CPU on every crawler fetch.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  const ex = getAgentsMdExamples();
  return [...examplesByLanguage(ex), ...examplesByFramework(ex).map((f) => f.guide)].map((l) => ({
    slug: checkSlug(SIGNAL_ID),
    lang: l.slug,
  }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug, lang } = await params;
  if (slug !== checkSlug(SIGNAL_ID)) notFound();
  const ex = getAgentsMdExamples();
  const framework = examplesByFramework(ex).find((f) => f.guide.slug === lang);
  if (framework) {
    return pageCard({
      title: frameworkExamplesTitle(framework),
      sub: `${framework.passing} of ${framework.rows.length} ${framework.guide.label} repos' files pass our check in full.`,
      path: frameworkExamplesPath(lang),
    });
  }
  const language = examplesByLanguage(ex).find((l) => l.slug === lang);
  if (!language) notFound();

  return pageCard({
    title: languageExamplesTitle(language),
    sub: `${language.rows.length} of ${language.total} ${language.label} repos on the leaderboard have one; ${language.passing} pass our check in full.`,
    path: languageExamplesPath(lang),
  });
}

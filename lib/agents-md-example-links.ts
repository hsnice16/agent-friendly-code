import { type AgentsMdExamples, examplesByLanguage } from "./agents-md-examples";
import { examplesByFramework } from "./agents-md-frameworks";
import type { FrameworkGuide } from "./framework-guides/types";
import { frameworkExamplesPath, languageExamplesPath } from "./utils/check-path";
import { languageSlug } from "./utils/language";

export type ExampleLink = { href: string; label: string };

type Examples = Pick<AgentsMdExamples, "rows" | "languages">;
type RepoKey = { host: string; owner: string; name: string; language: string | null };

const keyOf = (r: Omit<RepoKey, "language">) => `${r.host}/${r.owner}/${r.name}`.toLowerCase();

/** Only pages that are built: a language or framework under its minimum has no page. */
export function exampleLinksForRepo(ex: Examples, repo: RepoKey): ExampleLink[] {
  const slug = repo.language ? languageSlug(repo.language) : null;
  const lang = slug ? examplesByLanguage(ex).find((l) => l.slug === slug) : undefined;
  const key = keyOf(repo);
  const framework = examplesByFramework(ex).find(
    (f) => f.guide.frameworkRepo.toLowerCase() === key || f.guide.repos.some((k) => k.toLowerCase() === key),
  );
  return [
    ...(lang
      ? [{ href: languageExamplesPath(lang.slug), label: `AGENTS.md examples from other ${lang.label} repos` }]
      : []),
    ...(framework
      ? [{ href: frameworkExamplesPath(framework.guide.slug), label: `${framework.guide.label} AGENTS.md guide` }]
      : []),
  ];
}

/** Framework pages for apps written in this language. */
export function frameworkLinksForLanguage(ex: Examples, slug: string): ExampleLink[] {
  return examplesByFramework(ex)
    .filter((f) => f.guide.languages.some((l) => languageSlug(l) === slug))
    .map((f) => ({ href: frameworkExamplesPath(f.guide.slug), label: f.guide.label }));
}

/** Language pages for the languages a framework's apps are written in. */
export function languageLinksForFramework(ex: Examples, guide: Pick<FrameworkGuide, "languages">): ExampleLink[] {
  const built = examplesByLanguage(ex);
  return guide.languages.flatMap((name) => {
    const lang = built.find((l) => l.slug === languageSlug(name));
    return lang ? [{ href: languageExamplesPath(lang.slug), label: lang.label }] : [];
  });
}

/** Every built language page, most files first. */
export function languageExampleLinks(ex: Examples): ExampleLink[] {
  return examplesByLanguage(ex).map((l) => ({ href: languageExamplesPath(l.slug), label: l.label }));
}

export function frameworkExampleLinks(ex: Examples): ExampleLink[] {
  return examplesByFramework(ex).map((f) => ({ href: frameworkExamplesPath(f.guide.slug), label: f.guide.label }));
}

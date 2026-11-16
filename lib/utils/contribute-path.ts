export const CONTRIBUTE_PATH = "/contribute";

/** The section id on /contribute for one language, by its hub slug. */
export function contributeAnchor(languageSlug: string): string {
  return `lang-${languageSlug}`;
}

export function contributeLanguageHref(languageSlug: string): string {
  return `${CONTRIBUTE_PATH}#${contributeAnchor(languageSlug)}`;
}

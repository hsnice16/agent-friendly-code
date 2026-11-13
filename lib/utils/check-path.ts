import { SIGNAL_BY_ID } from "@/lib/scoring/signals";

export function checkSlug(signalId: string): string {
  return signalId.replace(/_/g, "-");
}

export function checkPath(signalId: string): string {
  return `/check/${checkSlug(signalId)}`;
}

export function signalIdFromSlug(slug: string): string | null {
  const id = slug.replace(/-/g, "_");
  // A slug with an underscore would map to the same id and serve a duplicate page.
  return checkSlug(id) === slug && Object.hasOwn(SIGNAL_BY_ID, id) ? id : null;
}

export const CHECKS_CRUMB = { name: "Checks", path: "/check" };

// A spaced slash in a crumb reads as one more level of the trail.
const CRUMB_LABEL: Record<string, string> = {
  agents_md: "AGENTS.md",
  linter: "Linter config",
  pre_commit: "Pre-commit hooks",
};

export function checkCrumb(signalId: string): { name: string; path: string } {
  return { name: CRUMB_LABEL[signalId] ?? SIGNAL_BY_ID[signalId].label, path: checkPath(signalId) };
}

export type CheckSubPage = "examples" | "vs-claude-md" | "vs-agents-md";

export function checkSubPath(signalId: string, page: CheckSubPage): string {
  return `${checkPath(signalId)}/${page}`;
}

export function languageExamplesPath(languageSlug: string): string {
  return `${checkSubPath("agents_md", "examples")}/${languageSlug}`;
}

// Shares the language pages' segment; tests/agents-md-frameworks.test.ts keeps the slugs apart.
export function frameworkExamplesPath(frameworkSlug: string): string {
  return languageExamplesPath(frameworkSlug);
}

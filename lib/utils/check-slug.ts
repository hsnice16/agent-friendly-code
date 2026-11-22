// Apart from check-path.ts, which imports the signal registry, so client views can build check URLs.

export function checkSlug(signalId: string): string {
  return signalId.replace(/_/g, "-");
}

export function checkPath(signalId: string): string {
  return `/check/${checkSlug(signalId)}`;
}

export type CheckSubPage = "examples" | "vs-claude-md" | "vs-agents-md";

export function checkSubPath(signalId: string, page: CheckSubPage): string {
  return `${checkPath(signalId)}/${page}`;
}

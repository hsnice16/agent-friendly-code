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

export const COMPARE_PATH = "/compare";

export const COMPARE_CRUMB = { name: "Compare agents", path: COMPARE_PATH };

export function comparePath(pairSlug: string): string {
  return `${COMPARE_PATH}/${pairSlug}`;
}

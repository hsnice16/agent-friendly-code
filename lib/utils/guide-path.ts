export const GUIDE_PATH = "/guide";

export const GUIDE_CRUMB = { name: "Guide", path: GUIDE_PATH };

export function guidePath(slug: string): string {
  return `${GUIDE_PATH}/${slug}`;
}

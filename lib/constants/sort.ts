export const SORT_KEYS = ["score", "stars"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_DIRS = ["desc", "asc"] as const;
export type SortDir = (typeof SORT_DIRS)[number];

export const DEFAULT_SORT: SortKey = "score";
export const DEFAULT_DIR: SortDir = "desc";

export function isSortKey(v: string | undefined | null): v is SortKey {
  return v != null && (SORT_KEYS as readonly string[]).includes(v);
}

export function isSortDir(v: string | undefined | null): v is SortDir {
  return v != null && (SORT_DIRS as readonly string[]).includes(v);
}

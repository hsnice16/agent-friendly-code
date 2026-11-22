import { getLeaderboardStats } from "./db";

/**
 * When any repo's score or description last changed, for pages whose counts and lists come from
 * the whole board: a visible "Updated" date and the JSON-LD dateModified both use it.
 */
export function boardModified(): string | null {
  const { contentChangedAt } = getLeaderboardStats();
  return contentChangedAt != null ? new Date(contentChangedAt * 1000).toISOString() : null;
}

export function rowsModified(rows: { content_changed_at: number | null }[]): string | null {
  const changed = Math.max(0, ...rows.map((r) => r.content_changed_at ?? 0));
  return changed > 0 ? new Date(changed * 1000).toISOString() : null;
}

// The framework pages' guide text changes with no row moving; bump this when it does.
const FRAMEWORK_GUIDES_UPDATED = Date.parse("2026-11-16");

export function frameworkModified(f: { rows: { content_changed_at: number | null }[] }): string {
  const rows = rowsModified(f.rows);
  return new Date(Math.max(rows ? Date.parse(rows) : 0, FRAMEWORK_GUIDES_UPDATED)).toISOString();
}

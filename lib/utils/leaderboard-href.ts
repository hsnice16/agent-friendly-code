import type { Host } from "@/lib/constants/hosts";
import { DEFAULT_DIR, DEFAULT_SORT, type SortDir, type SortKey } from "@/lib/constants/sort";
import { MODEL_BY_ID, type ModelId } from "@/lib/scoring/weights";

export type LeaderboardHrefParts = {
  q?: string;
  dir: SortDir;
  page: number;
  sort: SortKey;
  host: Host | "all";
  model: ModelId | "overall";
};

// `in` would also accept `constructor` and the rest of Object.prototype.
export function isModelId(value: string | null | undefined): value is ModelId {
  return value != null && Object.hasOwn(MODEL_BY_ID, value);
}

export function modelPath(id: ModelId): string {
  return `/model/${id}`;
}

export function leaderboardHref(parts: LeaderboardHrefParts): string {
  const p = new URLSearchParams();

  // Defaults stay out of the URL so each board has one address.
  if (parts.host !== "all") {
    p.set("host", parts.host);
  }
  if (parts.q) {
    p.set("q", parts.q);
  }
  if (parts.sort !== DEFAULT_SORT) {
    p.set("sort", parts.sort);
  }
  if (parts.dir !== DEFAULT_DIR) {
    p.set("dir", parts.dir);
  }
  if (parts.page > 1) {
    p.set("page", String(parts.page));
  }

  // The agent is a path segment because its board ranks differently and is
  // indexed as its own page; the params above only re-cut a board.
  const base = parts.model === "overall" ? "/" : modelPath(parts.model);
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

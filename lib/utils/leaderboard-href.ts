import type { Host } from "@/lib/constants/hosts";
import { DEFAULT_DIR, DEFAULT_SORT, type SortDir, type SortKey } from "@/lib/constants/sort";
import type { ModelId } from "@/lib/scoring/weights";

export type LeaderboardHrefParts = {
  q?: string;
  dir: SortDir;
  page: number;
  sort: SortKey;
  host: Host | "all";
  badge?: boolean;
  model: ModelId | "overall";
};

export function modelPath(id: ModelId): string {
  return `/model/${id}`;
}

export function boardBasePath(model: ModelId | "overall"): string {
  return model === "overall" ? "/" : modelPath(model);
}

/** An uncut board page: `/`, `/model/<id>`, or either with `/page/<n>`. */
export function boardPagePath(model: ModelId | "overall", page: number): string {
  return leaderboardHref({ model, page, host: "all", sort: DEFAULT_SORT, dir: DEFAULT_DIR });
}

export function leaderboardHref(parts: LeaderboardHrefParts): string {
  const p = new URLSearchParams();

  // Defaults stay out of the URL so each board has one address.
  if (parts.host !== "all") {
    p.set("host", parts.host);
  }
  if (parts.badge) {
    p.set("badge", "1");
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

  // The agent is a path segment because its board ranks differently and is
  // indexed as its own page; the params above only re-cut a board. An uncut
  // page is a prerendered path too, while a re-cut one is sorted in the browser.
  const base = boardBasePath(parts.model);
  if (parts.page > 1) {
    if (p.toString() === "") {
      return `${base === "/" ? "" : base}/page/${parts.page}`;
    }
    p.set("page", String(parts.page));
  }
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

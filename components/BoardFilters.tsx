"use client";

import type { AnalyticsEvent } from "@/lib/analytics-events";
import type { BoardQuery } from "@/lib/board";
import { BadgeFilterToggle } from "./BadgeFilterToggle";
import { HostSelect } from "./HostSelect";
import { SortSelect } from "./SortSelect";

export type FilterChange = {
  patch: Partial<Pick<BoardQuery, "host" | "badge" | "sort" | "dir">>;
  filter: Extract<AnalyticsEvent, { name: "leaderboard_filter" }>["filter"];
  option: string;
};

export function BoardFilters({ query, onChange }: { query: BoardQuery; onChange: (change: FilterChange) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <HostSelect value={query.host} onChange={(host) => onChange({ patch: { host }, filter: "host", option: host })} />
      <BadgeFilterToggle
        value={query.badge}
        onChange={(badge) => onChange({ patch: { badge }, filter: "badge", option: badge ? "on" : "off" })}
      />
      <SortSelect
        sort={query.sort}
        dir={query.dir}
        onChange={(sort, dir) => onChange({ patch: { sort, dir }, filter: "sort", option: `${sort}-${dir}` })}
      />
    </div>
  );
}

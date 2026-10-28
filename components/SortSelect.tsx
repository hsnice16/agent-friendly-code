"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

import { track } from "@/lib/analytics-events";
import { DEFAULT_DIR, DEFAULT_SORT, type SortDir, type SortKey } from "@/lib/constants/sort";
import { SelectMenu, type SelectMenuOption } from "./SelectMenu";

type Props = { sort: SortKey; dir: SortDir };

const OPTIONS: SelectMenuOption[] = [
  {
    shortLabel: "Rank",
    value: "score-desc",
    label: "Rank (best score first)",
  },
  {
    value: "score-asc",
    shortLabel: "Score · worst",
    label: "Score · worst first",
  },
  {
    value: "stars-desc",
    shortLabel: "Stars · most",
    label: "Stars · most first",
  },
  {
    value: "stars-asc",
    shortLabel: "Stars · fewest",
    label: "Stars · fewest first",
  },
];

export function SortSelect({ sort, dir }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const paramsRef = useRef(params);

  paramsRef.current = params;
  const value = `${sort}-${dir}`;

  const onChange = (v: string) => {
    if (v === value) return;
    const [nextSort, nextDir] = v.split("-") as [SortKey, SortDir];
    const next = new URLSearchParams(paramsRef.current.toString());

    if (nextSort === DEFAULT_SORT) {
      next.delete("sort");
    } else {
      next.set("sort", nextSort);
    }

    if (nextDir === DEFAULT_DIR) {
      next.delete("dir");
    } else {
      next.set("dir", nextDir);
    }

    next.delete("page");
    const qs = next.toString();

    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    track({ name: "leaderboard_filter", filter: "sort", option: v });
  };

  return <SelectMenu value={value} options={OPTIONS} label="Sort order" onChange={onChange} />;
}

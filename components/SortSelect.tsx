"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

import { DEFAULT_DIR, DEFAULT_SORT, type SortDir, type SortKey } from "@/lib/constants/sort";
import { SelectMenu, type SelectMenuOption } from "./SelectMenu";

type Props = { sort: SortKey; dir: SortDir };

const OPTIONS: SelectMenuOption[] = [
  {
    shortLabel: "Rank",
    value: "score-desc",
    label: "Rank (agent-friendliness)",
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
  const params = useSearchParams();
  const paramsRef = useRef(params);

  paramsRef.current = params;
  const value = `${sort}-${dir}`;

  const onChange = (v: string) => {
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

    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  };

  return <SelectMenu value={value} options={OPTIONS} label="Sort order" onChange={onChange} />;
}

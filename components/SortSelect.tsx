"use client";

import type { SortDir, SortKey } from "@/lib/constants/sort";
import { SelectMenu, type SelectMenuOption } from "./SelectMenu";

type Props = { sort: SortKey; dir: SortDir; onChange: (sort: SortKey, dir: SortDir) => void };

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

export function SortSelect({ sort, dir, onChange }: Props) {
  const value = `${sort}-${dir}`;

  return (
    <SelectMenu
      value={value}
      options={OPTIONS}
      label="Sort order"
      onChange={(v) => {
        if (v === value) return;
        const [nextSort, nextDir] = v.split("-") as [SortKey, SortDir];
        onChange(nextSort, nextDir);
      }}
    />
  );
}

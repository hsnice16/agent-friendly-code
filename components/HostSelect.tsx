"use client";

import { HOST_LABELS, HOSTS, type Host } from "@/lib/constants/hosts";
import { SelectMenu, type SelectMenuOption } from "./SelectMenu";

const OPTIONS: SelectMenuOption[] = [
  { value: "all", label: "All platforms", shortLabel: "All" },
  ...HOSTS.map((h) => ({ value: h, label: HOST_LABELS[h] })),
];

export function HostSelect({ value, onChange }: { value: Host | "all"; onChange: (value: Host | "all") => void }) {
  return (
    <SelectMenu
      value={value}
      options={OPTIONS}
      label="Filter by platform"
      onChange={(v) => {
        if (v !== value) onChange(v as Host | "all");
      }}
    />
  );
}

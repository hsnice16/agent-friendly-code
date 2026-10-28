"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

import { track } from "@/lib/analytics-events";
import { HOST_LABELS, HOSTS, type Host } from "@/lib/constants/hosts";
import { SelectMenu, type SelectMenuOption } from "./SelectMenu";

const OPTIONS: SelectMenuOption[] = [
  { value: "all", label: "All platforms", shortLabel: "All" },
  ...HOSTS.map((h) => ({ value: h, label: HOST_LABELS[h] })),
];

export function HostSelect({ value }: { value: Host | "all" }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const paramsRef = useRef(params);

  paramsRef.current = params;

  const onChange = (v: string) => {
    if (v === value) return;
    const next = new URLSearchParams(paramsRef.current.toString());

    if (v === "all") {
      next.delete("host");
    } else {
      next.set("host", v);
    }

    next.delete("page");
    const qs = next.toString();

    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    track({ name: "leaderboard_filter", filter: "host", option: v });
  };

  return <SelectMenu value={value} options={OPTIONS} onChange={onChange} label="Filter by platform" />;
}

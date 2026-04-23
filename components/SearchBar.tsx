"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = {
  placeholder?: string;
};

const DEBOUNCE_MS = 200;

export function SearchBar({ placeholder = "Search repos by owner/name" }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const currentQ = params.get("q") ?? "";

  const [value, setValue] = useState(currentQ);

  useEffect(() => {
    setValue(currentQ);
  }, [currentQ]);

  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    const t = setTimeout(() => {
      const pushQ = value.trim();
      const urlQ = paramsRef.current.get("q") ?? "";

      if (pushQ === urlQ) {
        return;
      }

      const next = new URLSearchParams(paramsRef.current.toString());
      if (pushQ) {
        next.set("q", pushQ);
      } else {
        next.delete("q");
      }

      next.delete("page");
      router.replace(`/?${next.toString()}`, { scroll: false });
    }, DEBOUNCE_MS);

    return () => clearTimeout(t);
  }, [value, router]);

  return (
    <search className="relative min-w-0 flex-1">
      <label htmlFor="repo-search" className="sr-only">
        {placeholder}
      </label>

      <MagnifyingGlass
        size={14}
        weight="bold"
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
      />

      <input
        type="search"
        value={value}
        id="repo-search"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        className="block w-full rounded-md border border-line bg-surface py-1.5 pl-8 pr-3 text-[13px] text-ink placeholder:text-muted outline-none"
      />
    </search>
  );
}

"use client";

import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { REGISTRIES, type Registry } from "@/lib/clients/registries";

export function PackageLookupForm() {
  const router = useRouter();
  const [registry, setRegistry] = useState<Registry>("npm");
  const [name, setName] = useState("");

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }
    router.push(`/package/${registry}/${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
      <div className="relative w-full sm:w-auto">
        <label htmlFor="package-registry" className="sr-only">
          Registry
        </label>
        <select
          value={registry}
          id="package-registry"
          onChange={(e) => setRegistry(e.target.value as Registry)}
          className="h-9 w-full appearance-none rounded-md border border-line bg-surface-2 pl-3 pr-8 text-[13.5px] text-ink cursor-pointer sm:w-auto"
        >
          {REGISTRIES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <CaretDown
          size={11}
          weight="bold"
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>

      <label htmlFor="package-name" className="sr-only">
        Package name
      </label>
      <input
        type="text"
        value={name}
        id="package-name"
        autoComplete="off"
        spellCheck={false}
        placeholder="package name"
        onChange={(e) => setName(e.target.value)}
        className="h-9 w-full min-w-0 rounded-md border border-line bg-surface-2 px-3 text-[13.5px] text-ink placeholder:text-muted sm:flex-1"
      />

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-line bg-ink px-4 text-[13.5px] font-medium text-accent-ink hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <MagnifyingGlass size={13} weight="bold" aria-hidden="true" />
        Look up
      </button>
    </form>
  );
}

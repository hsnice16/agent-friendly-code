"use client";

import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { track } from "@/lib/analytics-events";
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
    track({ name: "package_lookup", registry });
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
          className="field w-full appearance-none pr-8! cursor-pointer sm:w-auto"
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
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
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
        className="field w-full sm:flex-1"
      />

      <button type="submit" disabled={!canSubmit} className="btn-primary w-full sm:w-auto">
        <MagnifyingGlass size={15} weight="bold" aria-hidden="true" />
        Look up
      </button>
    </form>
  );
}

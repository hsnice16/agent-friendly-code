"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { parseRepoUrl } from "@/lib/clients/github";
import { SUPPORTED_HOSTS } from "@/lib/live-score/supported";
import { hostLabel } from "@/lib/utils/format";

export function LiveScoreForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = parseRepoUrl(value);
    if (!parsed) {
      setError("That doesn't look like a repo URL. Try github.com/owner/name.");
      return;
    }

    if (!SUPPORTED_HOSTS.includes(parsed.host)) {
      setError(`${hostLabel(parsed.host)} support is coming — GitHub repos work today.`);
      return;
    }

    setError(null);
    setPending(true);
    router.push(`/score/${parsed.host}/${parsed.owner}/${parsed.name}`);
  }

  return (
    <form onSubmit={submit} className="mt-5">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <input
          type="text"
          value={value}
          disabled={pending}
          inputMode="url"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-label="Repository URL"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "live-score-error" : undefined}
          placeholder="github.com/owner/name"
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted focus:border-ink-dim focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || value.trim() === ""}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-line bg-ink px-4 py-2.5 text-[15px] font-medium text-accent-ink hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Scoring…" : "Score"}
          {!pending && <ArrowRight size={15} weight="bold" aria-hidden="true" />}
        </button>
      </div>

      {error && (
        <p id="live-score-error" role="alert" className="mt-2 text-[13.5px] text-bad">
          {error}
        </p>
      )}
    </form>
  );
}

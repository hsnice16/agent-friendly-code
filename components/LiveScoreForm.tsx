"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { track } from "@/lib/analytics-events";
import { findBoardRepo } from "@/lib/board";
import { SUPPORTED_HOSTS } from "@/lib/live-score/supported";
import { parseRepoUrl } from "@/lib/repo-url";
import { loadBoardData } from "@/lib/use-board-data";
import { hostLabel } from "@/lib/utils/format";
import { liveScorePath, repoPath } from "@/lib/utils/repo-path";

export function LiveScoreForm({ className = "mt-5" }: { className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = parseRepoUrl(value);
    if (!parsed) {
      setError("That doesn't look like a repo link. Try github.com/owner/name.");
      return;
    }

    if (!SUPPORTED_HOSTS.includes(parsed.host)) {
      // Live Score can't read this host, but the board may already have the
      // repo; /api/board is the static list the boards re-cut anyway.
      setError(null);
      setPending(true);
      const onBoard = await loadBoardData().then(
        (data) => findBoardRepo(data, parsed),
        () => null,
      );
      if (onBoard) {
        router.push(repoPath(onBoard));
        return;
      }
      setPending(false);
      setError(`${hostLabel(parsed.host)} is coming soon. GitHub repos work today.`);
      return;
    }

    setError(null);
    setPending(true);
    track({ name: "live_score_submit", host: parsed.host });
    router.push(liveScorePath(parsed));
  }

  return (
    <form onSubmit={submit} className={className}>
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
          aria-label="Repo link"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "live-score-error" : undefined}
          placeholder="github.com/owner/name"
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          className="field flex-1"
        />
        <button type="submit" disabled={pending || value.trim() === ""} className="btn-primary shrink-0">
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

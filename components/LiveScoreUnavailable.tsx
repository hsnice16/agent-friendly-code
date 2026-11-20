import Link from "next/link";

import { SKILL_INSTALL_CMD } from "@/lib/version";

import { CopySnippet } from "./CopySnippet";
import { Panel } from "./Panel";
import { TrackEvent } from "./TrackEvent";

export function LiveScoreUnavailable({ reason, outcome }: { reason: string; outcome: "not_found" | "too_large" }) {
  return (
    <Panel>
      <TrackEvent event={{ name: "live_score_result", outcome }} />
      <h1 className="m-0 text-[19px] font-semibold tracking-tight">Couldn&apos;t score this repo</h1>
      <p className="mt-2 max-w-[64ch] text-[14.5px] text-ink-dim">{reason}</p>
      {/* A private repo answers 404 like a typo, so this is where people with work repos land. */}
      <p className="mt-3 max-w-[64ch] text-[14.5px] text-ink-dim">
        {outcome === "not_found" ? "Private repo? " : ""}Score it on your own computer with the{" "}
        <Link href="/skill" className="prose-link">
          agent skill
        </Link>
        ; nothing leaves your machine:
      </p>
      <CopySnippet text={SKILL_INSTALL_CMD} highlight="tip" event={{ name: "copy_install", tool: "skill" }} />
      <Link href="/score" className="mt-3.5 inline-block text-[14px] dim-link">
        ← Try another repo
      </Link>
    </Panel>
  );
}

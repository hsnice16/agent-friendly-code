import type { ReactNode } from "react";

import type { ModelId } from "@/lib/scoring/weights";
import { guidePath } from "@/lib/utils/guide-path";

import { ExternalLink } from "./ExternalLink";
import { IntentLink } from "./IntentLink";

// The searches that land on these boards mostly want something else: "best
// repos for claude code" results list Claude Code tooling, and "cursor
// leaderboard" means Cursor's own team leaderboard or CursorBench. Saying so
// up front beats a quick back to the results.
const BRIDGE: Partial<Record<ModelId, ReactNode>> = {
  "claude-code": (
    <>
      This ranks open-source projects set up for Claude Code, not Claude Code plugins. Looking for skills? See{" "}
      <IntentLink href="/skill" className="prose-link">
        our agent skill
      </IntentLink>{" "}
      and{" "}
      <IntentLink href={guidePath("agents-md-vs-skills")} className="prose-link">
        AGENTS.md vs skills
      </IntentLink>
      .
    </>
  ),
  cursor: (
    <>
      This ranks open-source projects set up for Cursor, not Cursor&rsquo;s in-app team leaderboard or model scores like{" "}
      <ExternalLink href="https://epoch.ai/benchmarks/cursorbench">CursorBench</ExternalLink>.
    </>
  ),
};

export function BoardIntentBridge({ model }: { model: ModelId }) {
  const text = BRIDGE[model];
  return text ? <p className="mt-2 mb-0 max-w-[72ch] text-[13px] text-muted">{text}</p> : null;
}

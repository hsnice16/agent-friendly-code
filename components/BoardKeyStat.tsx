import { ADOPTION } from "@/lib/agents-md-report";
import { formatDay } from "@/lib/utils/format";
import { REPORT_PATH } from "@/lib/utils/report-path";

import { IntentLink } from "./IntentLink";

/** One dated, quotable figure from the adoption series; its date is the snapshot's, not the build's. */
export function BoardKeyStat({ claudeMd = false }: { claudeMd?: boolean }) {
  const last = ADOPTION.points[ADOPTION.points.length - 1];

  return (
    <p className="mt-2 mb-0 max-w-[72ch] text-[14px] text-muted">
      <IntentLink href={REPORT_PATH} className="prose-link">
        {last.agentsMd} of {last.repos} repos on the board have an AGENTS.md
      </IntentLink>
      {claudeMd && `, and ${last.claudeMd} more have a CLAUDE.md but no AGENTS.md`} (as of {formatDay(last.date)}).
    </p>
  );
}

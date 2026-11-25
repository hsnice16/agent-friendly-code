import type { AgentStanding } from "@/lib/agent-scores";
import { checkPath } from "@/lib/utils/check-path";
import { percent } from "@/lib/utils/format";
import { HUB_AGENTS_ID } from "@/lib/utils/language";

import { AgentStandingsTable } from "./AgentStandingsTable";
import { IntentLink } from "./IntentLink";
import { Panel, PanelHeading } from "./Panel";

type Share = { file: string; signalId: string; count: number };

/** A language hub's per-agent standings: which agent its repos are best set up for. */
export function LanguageAgentsSection({
  label,
  repos,
  standings,
  shares,
}: {
  label: string;
  repos: number;
  standings: AgentStanding[];
  shares: Share[];
}) {
  const [first, second] = standings;

  return (
    <div id={HUB_AGENTS_ID} className="mt-3.5 scroll-mt-20">
      <Panel>
        <PanelHeading>Which AI coding agent are {label} repos best set up for?</PanelHeading>
        <p className="mt-0 mb-3 text-[14.5px] text-ink-dim">
          <strong className="text-ink">{first.model.label}</strong>, at {first.average.toFixed(1)} on average
          {second && (
            <>
              , ahead of {second.model.label} at {second.average.toFixed(1)}
            </>
          )}
          . That measures setup weighted by what each agent&apos;s docs say it reads, not which agent writes better{" "}
          {label}.
        </p>
        <AgentStandingsTable standings={standings} label={label} />
        <p className="mt-3 mb-0 text-[13px] text-muted">
          Agent files:{" "}
          {shares.map((f, i) => (
            <span key={f.file}>
              {i > 0 && " · "}
              <IntentLink href={checkPath(f.signalId)} className="prose-link">
                {f.file}
              </IntentLink>{" "}
              <span className="tabular-nums">
                {f.count} ({percent(f.count, repos)})
              </span>
            </span>
          ))}
          . &ldquo;Top for&rdquo; counts the repos where the agent scores highest, ties counting for each.
        </p>
      </Panel>
    </div>
  );
}

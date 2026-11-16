import type { CheckPractice } from "@/lib/check-content/practice";
import { distinctSourceLabels } from "@/lib/leaderboard-model-panel";
import { percent } from "@/lib/utils/format";

import { CodeText } from "./CodeText";
import { CopySnippet } from "./CopySnippet";
import { ExternalLink } from "./ExternalLink";
import { Panel, PanelHeading } from "./Panel";

export function CheckPracticePanel({
  practice,
  stats,
}: {
  practice: CheckPractice;
  stats: { full: number; total: number };
}) {
  return (
    <Panel>
      <PanelHeading>{practice.heading}</PanelHeading>
      <ul className="m-0 ml-5 list-disc text-[14.5px] leading-relaxed text-ink-dim">
        {practice.items.map((line) => (
          <li key={line}>
            <CodeText text={line} />
          </li>
        ))}
      </ul>
      {practice.snippet && (
        <div className="mt-3">
          <p className="m-0 mb-1.5 font-mono text-[12.5px] text-muted">{practice.snippet.caption}</p>
          <CopySnippet text={practice.snippet.text} label={practice.snippet.caption} />
        </div>
      )}
      <p className="mt-3 mb-0 text-[13px] text-muted">
        {stats.full} of {stats.total} leaderboard repos pass this check in full ({percent(stats.full, stats.total)}).
        Sources:{" "}
        {distinctSourceLabels(practice.sources).map((label, i) => (
          <span key={practice.sources[i]}>
            {i > 0 && ", "}
            <ExternalLink href={practice.sources[i]}>{label}</ExternalLink>
          </span>
        ))}
        .
      </p>
    </Panel>
  );
}

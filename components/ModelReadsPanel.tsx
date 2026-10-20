import Link from "next/link";

import { type ModelPanel, sourceLabel } from "@/lib/leaderboard-model-panel";
import type { ModelProfile } from "@/lib/scoring/weights";
import { checkPath, checkSubPath } from "@/lib/utils/check-path";
import { percent } from "@/lib/utils/format";

import { ExternalLink } from "./ExternalLink";
import { Panel, PanelHeading } from "./Panel";

const LINK = "font-medium text-ink hover:text-ink-soft";

export function ModelReadsPanel({ model, panel }: { model: ModelProfile; panel: ModelPanel }) {
  const { checks, sources, file } = panel;
  const claudeMd = file?.id === "claude_md";

  return (
    <div className="mb-5">
      <Panel>
        <PanelHeading>What {model.label} reads in a repo</PanelHeading>

        <p className="m-0 mb-2 text-[13px] text-muted">
          Its highest-weighted checks, and the share of leaderboard repos that pass each:
        </p>
        <ul className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-1.5 p-0 text-[14px] text-ink-dim sm:grid-cols-2">
          {checks.map((c) => (
            <li key={c.id} className="flex items-baseline justify-between gap-3">
              <Link href={checkPath(c.id)} className={LINK}>
                {c.label}
              </Link>
              <span className="shrink-0 tabular-nums">
                weight {c.weight.toFixed(1)} · {percent(c.counts.full, c.counts.total)} pass
              </span>
            </li>
          ))}
        </ul>

        {file && (
          <p className="mt-3 mb-0 text-[14px] text-ink-dim">
            <Link href={claudeMd ? checkSubPath("agents_md", "examples") : checkPath(file.id)} className={LINK}>
              {file.label}
            </Link>{" "}
            is in {file.present} of {file.total} leaderboard repos
            {claudeMd ? " (repos with both count under AGENTS.md unless it is empty)" : ""}.
          </p>
        )}

        {sources.length > 0 && (
          <p className="mt-3 mb-0 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[12.5px] text-muted">
            <span>Docs the weights cite:</span>
            {sources.map((url) => (
              <ExternalLink key={url} href={url} title={url}>
                {sourceLabel(url)}
              </ExternalLink>
            ))}
            <Link href={`/methodology#model-${model.id}`} className="text-ink-dim hover:text-ink-soft">
              all weights
            </Link>
          </p>
        )}
      </Panel>
    </div>
  );
}

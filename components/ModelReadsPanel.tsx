import Link from "next/link";

import { pairLabels } from "@/lib/compare-copy";
import { pairsWith } from "@/lib/compare-pairs";
import { type ModelPanel, sourceLabel } from "@/lib/leaderboard-model-panel";
import type { ModelProfile } from "@/lib/scoring/weights";
import { checkPath, checkSubPath } from "@/lib/utils/check-path";
import { comparePath } from "@/lib/utils/compare-path";
import { percent } from "@/lib/utils/format";

import { ExternalLink } from "./ExternalLink";
import { LINK_STRONG } from "./link-class";
import { Panel, PanelHeading } from "./Panel";

export function ModelReadsPanel({ model, panel }: { model: ModelProfile; panel: ModelPanel }) {
  const { checks, sources, file } = panel;
  const claudeMd = file?.id === "claude_md";
  const pairs = pairsWith(model.id);

  return (
    <div className="mb-5">
      <Panel>
        <PanelHeading>What {model.label} reads in a repo</PanelHeading>

        <p className="m-0 mb-2 text-[13px] text-muted">
          Its highest-weighted checks, and the share of leaderboard repos that pass each:
        </p>
        <ul className="m-0 grid list-none grid-cols-1 gap-x-6 p-0 text-[14px] text-ink-dim sm:grid-cols-2">
          {checks.map((c) => (
            <li key={c.id} className="flex items-baseline justify-between gap-3 link-row">
              <Link href={checkPath(c.id)} className={`${LINK_STRONG} cover-link`}>
                {c.label}
              </Link>
              <span className="text-right tabular-nums">
                weight {c.weight.toFixed(1)} · {percent(c.counts.full, c.counts.total)} pass
              </span>
            </li>
          ))}
        </ul>

        {file && (
          <p className="mt-3 mb-0 text-[14px] text-ink-dim">
            <Link href={claudeMd ? checkSubPath("agents_md", "examples") : checkPath(file.id)} className={LINK_STRONG}>
              {file.label}
            </Link>{" "}
            is in {file.present} of {file.total} leaderboard repos
            {claudeMd ? " (repos with both count under AGENTS.md unless it is empty)" : ""}.
          </p>
        )}

        {pairs.length > 0 && (
          <p className="mt-3 mb-0 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-muted">
            <span>Compare:</span>
            {pairs.map((p) => (
              <Link key={p.slug} href={comparePath(p.slug)} className="prose-link">
                {`${pairLabels(p).a} vs ${pairLabels(p).b}`}
              </Link>
            ))}
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
            <Link href={`/methodology#model-${model.id}`} className="prose-link">
              all weights
            </Link>
          </p>
        )}
      </Panel>
    </div>
  );
}

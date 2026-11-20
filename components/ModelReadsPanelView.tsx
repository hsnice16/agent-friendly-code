"use client";

import Link from "next/link";

import { ExternalLink } from "./ExternalLink";
import { LINK_STRONG } from "./link-class";
import { Panel, PanelHeading } from "./Panel";

type Href = { href: string; label: string };

export type Props = {
  modelId: string;
  modelLabel: string;
  /** `weight` and `pass` arrive formatted. */
  checks: (Href & { id: string; weight: string; pass: string })[];
  file: (Href & { present: number; total: number; claudeMd: boolean }) | null;
  pairs: Href[];
  sources: Href[];
};

export function ModelReadsPanelView({ modelId, modelLabel, checks, file, pairs, sources }: Props) {
  return (
    <div className="mb-5">
      <Panel>
        <PanelHeading>What {modelLabel} reads in a repo</PanelHeading>

        <p className="m-0 mb-2 text-[13px] text-muted">
          Its highest-weighted checks, and the share of leaderboard repos that pass each:
        </p>
        <ul className="m-0 grid list-none grid-cols-1 gap-x-6 p-0 text-[14px] text-ink-dim sm:grid-cols-2">
          {checks.map((c) => (
            <li key={c.id} className="flex items-baseline justify-between gap-3 link-row">
              <Link href={c.href} className={`${LINK_STRONG} cover-link`}>
                {c.label}
              </Link>
              <span className="text-right tabular-nums">
                weight {c.weight} · {c.pass} pass
              </span>
            </li>
          ))}
        </ul>

        {file && (
          <p className="mt-3 mb-0 text-[14px] text-ink-dim">
            <Link href={file.href} className={LINK_STRONG}>
              {file.label}
            </Link>{" "}
            is in {file.present} of {file.total} leaderboard repos
            {file.claudeMd ? " (repos with both count under AGENTS.md unless it is empty)" : ""}.
          </p>
        )}

        {pairs.length > 0 && (
          <p className="mt-3 mb-0 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-muted">
            <span>Compare:</span>
            {pairs.map((p) => (
              <Link key={p.href} href={p.href} className="prose-link">
                {p.label}
              </Link>
            ))}
          </p>
        )}

        {sources.length > 0 && (
          <p className="mt-3 mb-0 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[12.5px] text-muted">
            <span>Docs the weights cite:</span>
            {sources.map((s) => (
              <ExternalLink key={s.href} href={s.href} title={s.href}>
                {s.label}
              </ExternalLink>
            ))}
            <Link href={`/methodology#model-${modelId}`} className="prose-link">
              all weights
            </Link>
          </p>
        )}
      </Panel>
    </div>
  );
}

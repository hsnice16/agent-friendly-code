"use client";

import { SIGNAL_TEXT } from "@/lib/signal-text";
import { checkPath, checkSubPath } from "@/lib/utils/check-slug";

import { ExternalLink } from "./ExternalLink";
import { IntentLink } from "./IntentLink";
import { LINK_STRONG } from "./link-class";
import { Panel, PanelHeading } from "./Panel";

type Href = { href: string; label: string };

export type Props = {
  modelId: string;
  modelLabel: string;
  /** `weight` and `pass` arrive formatted. */
  checks: { id: string; weight: string; pass: string }[];
  /** `id` is a signal id, or "claude_md" for CLAUDE.md, which shares the AGENTS.md check. */
  file: { id: string; present: number; total: number } | null;
  /** The pair averages on /agents, when this agent is in a pair. */
  compareHref: string | null;
  sources: Href[];
  examples: Href[];
};

export function ModelReadsPanelView({ modelId, modelLabel, checks, file: f, compareHref, sources, examples }: Props) {
  const claudeMd = f?.id === "claude_md";
  const file = f && {
    ...f,
    label: claudeMd ? "CLAUDE.md" : SIGNAL_TEXT[f.id].label,
    href: claudeMd ? checkSubPath("agents_md", "examples") : checkPath(f.id),
  };

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
              <IntentLink href={checkPath(c.id)} className={`${LINK_STRONG} cover-link`}>
                {SIGNAL_TEXT[c.id].label}
              </IntentLink>
              <span className="text-right tabular-nums">
                weight {c.weight} · {c.pass} pass
              </span>
            </li>
          ))}
        </ul>

        {file &&
          (claudeMd ? (
            <p className="mt-3 mb-0 text-[14px] text-ink-dim">
              {file.present} of {file.total} leaderboard repos have a{" "}
              <IntentLink href={file.href} className={LINK_STRONG}>
                {file.label}
              </IntentLink>{" "}
              but no AGENTS.md.
            </p>
          ) : (
            <p className="mt-3 mb-0 text-[14px] text-ink-dim">
              <IntentLink href={file.href} className={LINK_STRONG}>
                {file.label}
              </IntentLink>{" "}
              is in {file.present} of {file.total} leaderboard repos.
            </p>
          ))}

        {examples.length > 0 && (
          <p className="mt-3 mb-0 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-muted">
            <span>AGENTS.md examples by language:</span>
            {examples.map((e) => (
              <IntentLink key={e.href} href={e.href} className="prose-link">
                {e.label}
              </IntentLink>
            ))}
          </p>
        )}

        {compareHref && (
          <p className="mt-3 mb-0 text-[13px] text-muted">
            <IntentLink href={compareHref} className="arrow-link">
              Compare with other agents →
            </IntentLink>
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
            <IntentLink href={`/methodology#model-${modelId}`} className="prose-link">
              all weights
            </IntentLink>
          </p>
        )}
      </Panel>
    </div>
  );
}

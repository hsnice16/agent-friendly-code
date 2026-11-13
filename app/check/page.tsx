import type { Metadata } from "next";
import Link from "next/link";

import { CodeText } from "@/components/CodeText";
import { LINK_STRONG } from "@/components/link-class";
import { PAGE_LEAD, PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { getCheckStats } from "@/lib/check-stats";
import { START_WITH_CHECKS } from "@/lib/constants/scoring";
import { checksBySummedWeight } from "@/lib/leaderboard-model-panel";
import { staticPageMetadata } from "@/lib/page-meta";
import { SIGNAL_BY_ID, SIGNALS } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { CHECKS_CRUMB, checkPath, checkSubPath } from "@/lib/utils/check-path";
import { percent } from "@/lib/utils/format";

export const metadata: Metadata = staticPageMetadata("/check");

export default function ChecksPage() {
  const total = getCheckStats(SIGNALS[0].id).total;
  const startWith = checksBySummedWeight(START_WITH_CHECKS);

  return (
    <>
      <PageHeader
        crumbs={{ current: CHECKS_CRUMB }}
        title={`Agent-ready codebase checklist: ${SIGNALS.length} checks and their pass rates`}
        lead="An agent-ready codebase is one where an AI coding agent can learn the project and check its own work from the files alone: an AGENTS.md or CLAUDE.md that explains it, a README, tests it can run, CI and linter config that show what a change must pass, a reproducible dev setup, and a size it can read."
      >
        <p className={`mt-2.5 ${PAGE_LEAD}`}>
          Every score here comes from these {SIGNALS.length} file checks. Each has a page: what it looks for, why agents
          need it, how to pass it, and how many of the {total} leaderboard repos do. The{" "}
          <Link href="/methodology" className="prose-link">
            methodology
          </Link>{" "}
          covers the weights, and the{" "}
          <Link href="/guide" className="prose-link">
            guide
          </Link>{" "}
          groups the checks into what to do.
        </p>
      </PageHeader>

      <div className="mb-5">
        <Panel tone="tip">
          <PanelHeading tone="tip">Start with these {START_WITH_CHECKS}</PanelHeading>
          <p className="m-0 mb-2.5 text-[13.5px] text-ink-dim">
            The most weight summed across all {MODELS.length} agents, so each fix moves every agent&apos;s score:
          </p>
          <ol className="m-0 ml-5 list-decimal text-[14.5px] leading-relaxed text-ink-dim">
            {startWith.map((c) => {
              const stats = getCheckStats(c.id);
              return (
                <li key={c.id}>
                  <Link href={checkPath(c.id)} className={LINK_STRONG}>
                    {SIGNAL_BY_ID[c.id].label}
                  </Link>{" "}
                  · summed weight {c.sum.toFixed(1)} · {percent(stats.full, stats.total)} of repos pass
                </li>
              );
            })}
          </ol>
          <p className="mt-3 mb-0 text-[14px] text-ink-dim">
            <Link href="/score" className="prose-link">
              Check your repo now
            </Link>{" "}
            to see which of the {SIGNALS.length} it passes, or read{" "}
            <Link href={checkSubPath("agents_md", "examples")} className="prose-link">
              real AGENTS.md examples
            </Link>{" "}
            from popular repos.
          </p>
        </Panel>
      </div>

      <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2">
        {SIGNALS.map((s) => {
          const stats = getCheckStats(s.id);
          return (
            <li key={s.id} className="relative tile">
              <div className="flex items-start justify-between gap-3">
                <Link href={checkPath(s.id)} className={`cover-link ${LINK_STRONG}`}>
                  {s.label}
                </Link>
                <span className="shrink-0 text-[13px] tabular-nums text-ink-dim">
                  {percent(stats.full, stats.total)} pass
                </span>
              </div>
              <p className="mt-1 mb-0 text-[13px] text-muted">
                <CodeText text={s.description} />
              </p>
            </li>
          );
        })}
      </ul>
    </>
  );
}

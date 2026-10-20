import type { Metadata } from "next";
import Link from "next/link";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { CodeText } from "@/components/CodeText";
import { Panel, PanelHeading } from "@/components/Panel";
import { getCheckStats } from "@/lib/check-stats";
import { checksBySummedWeight } from "@/lib/leaderboard-model-panel";
import { staticPageMetadata } from "@/lib/page-meta";
import { SIGNAL_BY_ID, SIGNALS } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { checkPath, checkSubPath } from "@/lib/utils/check-path";
import { percent } from "@/lib/utils/format";

const START_WITH = 3;
const LINK = "text-ink hover:text-ink-soft";

export const metadata: Metadata = staticPageMetadata("/check");

export default function ChecksPage() {
  const total = getCheckStats(SIGNALS[0].id).total;
  const startWith = checksBySummedWeight(START_WITH);

  return (
    <>
      <BreadcrumbJsonLd current={{ name: "Checks", path: "/check" }} />

      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">
          Agent-ready codebase checklist: {SIGNALS.length} checks and their pass rates
        </h1>
        <p className="m-0 mb-3 max-w-[72ch] text-[15.5px] leading-relaxed text-ink">
          An agent-ready codebase is one where an AI coding agent can learn the project and check its own work from the
          files alone: an AGENTS.md or CLAUDE.md that explains it, a README, tests it can run, CI and linter config that
          show what a change must pass, a reproducible dev setup, and a size it can read.
        </p>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          Every score here comes from these {SIGNALS.length} file checks. Each has a page: what it looks for, why agents
          need it, how to pass it, and how many of the {total} leaderboard repos do. The{" "}
          <Link href="/methodology" className="text-ink-dim hover:text-ink-soft">
            methodology
          </Link>{" "}
          covers the weights.
        </p>
      </section>

      <div className="mb-5">
        <Panel tone="warn">
          <PanelHeading tone="warn">Start with these {START_WITH}</PanelHeading>
          <p className="m-0 mb-2.5 text-[13.5px] text-ink-dim">
            The most weight summed across all {MODELS.length} agents, so each fix moves every agent&apos;s score:
          </p>
          <ol className="m-0 ml-5 list-decimal text-[14.5px] leading-relaxed text-ink-dim">
            {startWith.map((c) => {
              const stats = getCheckStats(c.id);
              return (
                <li key={c.id}>
                  <Link href={checkPath(c.id)} className="font-medium text-ink hover:text-ink-soft">
                    {SIGNAL_BY_ID[c.id].label}
                  </Link>{" "}
                  · summed weight {c.sum.toFixed(1)} · {percent(stats.full, stats.total)} of repos pass
                </li>
              );
            })}
          </ol>
          <p className="mt-3 mb-0 text-[14px] text-ink-dim">
            <Link href="/score" className={LINK}>
              Check your repo now
            </Link>{" "}
            to see which of the {SIGNALS.length} it passes, or read{" "}
            <Link href={checkSubPath("agents_md", "examples")} className={LINK}>
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
            <li key={s.id} className="relative rounded-lg border border-line bg-surface px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={checkPath(s.id)}
                  className="font-medium text-ink hover:text-ink-soft before:absolute before:inset-0 before:content-['']"
                >
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

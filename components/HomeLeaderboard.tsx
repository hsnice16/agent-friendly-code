import Link from "next/link";

import { CHANGELOG } from "@/lib/changelog";
import { HOSTS_TEXT } from "@/lib/leaderboard-meta";
import type { LeaderboardView } from "@/lib/leaderboard-view";
import type { LeaderboardStats } from "@/lib/types/db";
import { checkSubPath } from "@/lib/utils/check-path";
import { APP_VERSION } from "@/lib/version";
import { HomeJsonLd } from "./HomeJsonLd";
import { LeaderboardBoard } from "./LeaderboardBoard";
import { LiveScoreForm } from "./LiveScoreForm";
import { PAGE_LEAD, PageHeader } from "./PageHeader";
import { ReleaseAnnouncement } from "./ReleaseAnnouncement";

const CTA = "font-medium text-tip hover:text-ink";

type Props = {
  view: LeaderboardView;
  stats: LeaderboardStats;
};

export function HomeLeaderboard({ view, stats }: Props) {
  return (
    <>
      <HomeJsonLd view={view} contentChangedAt={stats.contentChangedAt} />

      <PageHeader title="Which public repos are easiest for AI coding agents to work in?">
        {/* Under the h1, not the subtitle: heatmaps showed the form below it went unseen.
            It stacks below `sm`, so the copy stays short to keep the board near the fold. */}
        <div className="callout mt-3 max-w-[640px]">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="glyph size-8 bg-tip/10 text-tip">
              <span className="icon-link" />
            </span>
            <p className="m-0 text-[15px] font-semibold text-ink">
              Is your repo ready for AI agents? Paste a GitHub URL to score it.
            </p>
          </div>
          <LiveScoreForm className="mt-3" />
        </div>

        <p className={`mt-4 ${PAGE_LEAD}`}>
          {/* Visitors click this line expecting a link. */}
          Repos from {HOSTS_TEXT},{" "}
          <Link href="/methodology" className="prose-link">
            scored on what each agent looks for
          </Link>
          , then ranked.
        </p>

        <p className="mt-3 max-w-[68ch] text-[13px] text-muted">
          Or check an{" "}
          <Link href="/package" className={CTA}>
            npm / PyPI / Cargo package
          </Link>
          , run the{" "}
          <Link href="/skill" className={CTA}>
            agent skill
          </Link>{" "}
          locally, add the{" "}
          <Link href="/action" className={CTA}>
            GitHub Action
          </Link>{" "}
          to score every pull request, or read{" "}
          <Link href={checkSubPath("agents_md", "examples")} className={CTA}>
            AGENTS.md examples
          </Link>{" "}
          from popular repos.
        </p>
      </PageHeader>

      {/* Announced only once the release it describes is the one deployed —
          otherwise a version bump ahead of the changelog entry (or behind it)
          would advertise the wrong thing. It points at the section that
          release is about, so move it when the next one is cut. */}
      {CHANGELOG[0]?.label === APP_VERSION && <ReleaseAnnouncement version={APP_VERSION} title={CHANGELOG[0].title} />}

      <LeaderboardBoard view={view} stats={stats} />
    </>
  );
}

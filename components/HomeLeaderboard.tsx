import Link from "next/link";

import { CHANGELOG } from "@/lib/changelog";
import { hostsText } from "@/lib/leaderboard-meta";
import type { LeaderboardView } from "@/lib/leaderboard-view";
import type { LeaderboardStats } from "@/lib/types/db";
import { APP_VERSION } from "@/lib/version";
import { HomeJsonLd } from "./HomeJsonLd";
import { LeaderboardBoard } from "./LeaderboardBoard";
import { LiveScoreForm } from "./LiveScoreForm";
import { ReleaseAnnouncement } from "./ReleaseAnnouncement";

const CTA = "border-b border-dotted border-warn/60 text-warn hover:border-warn hover:text-warn";

type Props = {
  view: LeaderboardView;
  stats: LeaderboardStats;
};

export function HomeLeaderboard({ view, stats }: Props) {
  return (
    <>
      <HomeJsonLd view={view} contentChangedAt={stats.contentChangedAt} />

      <section className="mb-5">
        <h1 className="mb-3 text-[26px] font-bold leading-[1.2] tracking-tight sm:text-[32px] sm:leading-[1.18]">
          Which public repos are easiest for AI coding agents to work in?
        </h1>
        <p className="m-0 max-w-[68ch] text-[15px] text-ink-dim sm:text-base">
          Repos from {hostsText(view.host)}, scored on what each agent looks for, then ranked.
        </p>

        {/* LiveScoreForm stacks below `sm`; the copy around it stays short so the board is still near the fold on a phone. */}
        <div className="mt-4 max-w-[640px] rounded-xl border border-line bg-surface px-4 pt-3 pb-4">
          <p className="m-0 text-[14.5px] font-medium text-ink">
            Is your repo ready for AI agents? Paste a GitHub URL.
          </p>
          <div className="-mt-2">
            <LiveScoreForm />
          </div>
        </div>

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
          <Link href="/check/agents-md/examples" className={CTA}>
            AGENTS.md examples
          </Link>{" "}
          from popular repos.
        </p>
      </section>

      {/* Announced only once the release it describes is the one deployed —
          otherwise a version bump ahead of the changelog entry (or behind it)
          would advertise the wrong thing. It sits above the section that
          release is about, so move it when the next one is cut. */}
      {CHANGELOG[0]?.label === APP_VERSION && <ReleaseAnnouncement version={APP_VERSION} title={CHANGELOG[0].title} />}

      <LeaderboardBoard view={view} stats={stats} />
    </>
  );
}

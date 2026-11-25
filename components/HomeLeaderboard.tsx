import { CHANGELOG } from "@/lib/changelog";
import { HOSTS_TEXT, pageRanks } from "@/lib/leaderboard-meta";
import type { LeaderboardView } from "@/lib/leaderboard-view";
import type { LeaderboardStats } from "@/lib/types/db";
import { checkSubPath } from "@/lib/utils/check-path";
import { GENERATOR_PATH } from "@/lib/utils/generator-path";
import { PACKAGE_PATH } from "@/lib/utils/package-path";
import { APP_VERSION } from "@/lib/version";

import { BoardKeyStat } from "./BoardKeyStat";
import { HomeJsonLd } from "./HomeJsonLd";
import { IntentLink } from "./IntentLink";
import { LeaderboardBoard } from "./LeaderboardBoard";
import { LiveScoreForm } from "./LiveScoreForm";
import { PAGE_LEAD, PageHeader } from "./PageHeader";
import { ReleaseAnnouncement } from "./ReleaseAnnouncement";
import { TrackedLink } from "./TrackedLink";

const CTA = "font-medium text-tip hover:text-ink";

type Props = {
  view: LeaderboardView;
  stats: LeaderboardStats;
};

export function HomeLeaderboard({ view, stats }: Props) {
  if (view.page > 1) {
    const { first, last } = pageRanks(view);
    return (
      <>
        <HomeJsonLd view={view} contentChangedAt={stats.contentChangedAt} />
        <PageHeader
          title={`Leaderboard: ranks ${first}–${last}`}
          lead={
            <>
              Page {view.page} of {view.totalPages}, ranked by the average of every agent&rsquo;s score.{" "}
              <IntentLink href="/" className="prose-link">
                Back to the top repos
              </IntentLink>
            </>
          }
        />
        <LeaderboardBoard view={view} stats={stats} rationale={false} />
      </>
    );
  }

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
          <p className="m-0 mt-2.5 text-[13px] text-muted">
            No AGENTS.md yet?{" "}
            <TrackedLink
              href={GENERATOR_PATH}
              prefetch={false}
              event={{ name: "generator_cta_click", page: "home" }}
              className={CTA}
            >
              Draft one from your repo →
            </TrackedLink>
          </p>
        </div>

        <p className={`mt-4 ${PAGE_LEAD}`}>
          {/* Visitors click this line expecting a link. */}
          Repos from {HOSTS_TEXT},{" "}
          <IntentLink href="/methodology" className="prose-link">
            scored on what each agent looks for
          </IntentLink>
          , then ranked.
        </p>
        <BoardKeyStat />

        <p className="mt-3 max-w-[68ch] text-[13px] text-muted">
          Or check an{" "}
          <IntentLink href={PACKAGE_PATH} className={CTA}>
            npm / PyPI / Cargo package
          </IntentLink>
          , run the{" "}
          <IntentLink href="/skill" className={CTA}>
            agent skill
          </IntentLink>{" "}
          locally, add the{" "}
          <IntentLink href="/action" className={CTA}>
            GitHub Action
          </IntentLink>{" "}
          to score every pull request, or read{" "}
          <IntentLink href={checkSubPath("agents_md", "examples")} className={CTA}>
            AGENTS.md examples
          </IntentLink>{" "}
          from popular repos.
        </p>
      </PageHeader>

      {/* Only while the deployed version has its changelog entry. It points at
          the section that release is about, so move it when the next is cut. */}
      {CHANGELOG[0]?.label === APP_VERSION && <ReleaseAnnouncement version={APP_VERSION} title={CHANGELOG[0].title} />}

      <LeaderboardBoard view={view} stats={stats} />
    </>
  );
}

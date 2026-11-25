import type { Metadata } from "next";
import Link from "next/link";

import { CheckChecklist } from "@/components/CheckChecklist";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { LiveScoreForm } from "@/components/LiveScoreForm";
import { PageHeader } from "@/components/PageHeader";
import { RecentScores } from "@/components/RecentScores";
import { getCheckStats } from "@/lib/check-stats";
import { listLeaderboardOverall } from "@/lib/db";
import { meetsLeadFloor } from "@/lib/leaderboard-meta";
import { PAGE_COPY, staticPageMetadata } from "@/lib/page-meta";
import { SIGNALS } from "@/lib/scoring/signals";
import { PUBLISHER_JSON_LD } from "@/lib/site-json-ld";
import { ogImage } from "@/lib/utils/og-image";
import { APP_NAME, APP_URL } from "@/lib/version";

import { SCORE_FAQ } from "./faq";

export const metadata: Metadata = staticPageMetadata(
  "/score",
  ogImage("/score", `${APP_NAME} — Live Score: any public GitHub repo, on demand`),
);

const JSON_LD = {
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${APP_URL}/score#app`,
      url: `${APP_URL}/score`,
      name: "Live Score: agent readiness checker",
      isAccessibleForFree: true,
      description: PAGE_COPY["/score"].description,
      publisher: PUBLISHER_JSON_LD,
      operatingSystem: "Any",
      applicationCategory: "DeveloperApplication",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      browserRequirements: "Requires JavaScript-enabled modern browser",
    },
  ],
};

const EXAMPLES_SHOWN = 10;

export default function ScoreIndexPage() {
  // Shown alongside the visitor's own scores, not replaced by them — otherwise
  // the curated list vanishes the moment someone scores anything.
  const examples = listLeaderboardOverall().filter(meetsLeadFloor).slice(0, EXAMPLES_SHOWN);

  return (
    <>
      <JsonLd data={JSON_LD} />

      <PageHeader
        crumbs={{ current: { name: "Live Score", path: "/score" } }}
        title="Agent readiness checker for GitHub repos"
        lead="Paste a public GitHub repo link to see how ready it is for AI coding agents: a score per agent, the one it is best set up for, and what to fix first. Free, no signup, nothing saved; same checks and weights as the leaderboard."
      >
        <LiveScoreForm />

        <p className="mt-3 text-[13px] text-muted">
          GitLab and Bitbucket repos already on the leaderboard open their page; scoring others is coming soon. Private
          or local repo:{" "}
          <Link href="/skill" className="prose-link">
            the agent skill
          </Link>
          . On every pull request:{" "}
          <Link href="/action" className="prose-link">
            the GitHub Action
          </Link>
          .
        </p>
      </PageHeader>

      <CheckChecklist rows={SIGNALS.map((s) => ({ id: s.id, label: s.label, ...getCheckStats(s.id) }))} />

      <div className="mt-3.5">
        <RecentScores
          past={examples.map((r) => ({ id: r.id, host: r.host, owner: r.owner, name: r.name, score: r.score ?? 0 }))}
        />
      </div>

      <div className="mt-3.5">
        <FaqSection heading="Questions" items={SCORE_FAQ} />
      </div>
    </>
  );
}

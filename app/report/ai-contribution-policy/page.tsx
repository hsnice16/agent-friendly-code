import type { Metadata } from "next";

import { AiPolicyTable, StanceChip } from "@/components/AiPolicyTable";
import { CiteThis } from "@/components/CiteThis";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { ReportBar, ReportStat } from "@/components/ReportStat";
import {
  AI_POLICY,
  aiPolicyDescription,
  aiPolicyJsonLd,
  aiPolicyTitle,
  namedProjects,
  policyAsks,
  repoKey,
  STANCE_LABEL,
  STANCES,
  stanceAnchor,
  stanceCounts,
} from "@/lib/ai-policy";
import { listLeaderboardOverall } from "@/lib/db";
import { checkPath } from "@/lib/utils/check-path";
import { CONTRIBUTE_PATH } from "@/lib/utils/contribute-path";
import { formatDay, percent } from "@/lib/utils/format";
import { GUIDE_PATH } from "@/lib/utils/guide-path";
import { ogImage } from "@/lib/utils/og-image";
import { pageTitle } from "@/lib/utils/page-title";
import { repoPath } from "@/lib/utils/repo-path";
import { AI_POLICY_REPORT_PATH } from "@/lib/utils/report-path";
import { OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const PROSE = "m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim";

export function generateMetadata(): Metadata {
  const title = aiPolicyTitle();
  const description = aiPolicyDescription();
  const image = ogImage(AI_POLICY_REPORT_PATH, title);
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: AI_POLICY_REPORT_PATH },
    twitter: { ...TWITTER_DEFAULTS, images: [image], title, description },
    openGraph: {
      ...OG_DEFAULTS,
      images: [image],
      title,
      description,
      url: AI_POLICY_REPORT_PATH,
      type: "article",
    },
  };
}

export default function AiPolicyReportPage() {
  const { policies, scanned, checked } = AI_POLICY;
  const counts = stanceCounts(policies);
  const asks = policyAsks(policies);
  const onBoard = new Set(listLeaderboardOverall().map(repoKey));
  const day = formatDay(checked);

  return (
    <>
      {aiPolicyJsonLd().map((d) => (
        <JsonLd key={String(d["@type"])} data={d} />
      ))}
      <PageHeader
        crumbs={{ current: { name: "AI contribution policies", path: AI_POLICY_REPORT_PATH } }}
        title={aiPolicyTitle()}
        lead={
          <>
            <strong className="text-ink">
              {policies.length} of the {scanned} popular GitHub repos we scanned have a written AI contribution policy
              we could find.
            </strong>{" "}
            {counts.bans} ban AI-generated code, {counts.restricts} restrict it, {counts.disclose} accept it with
            disclosure, {counts.allows} allow it and {counts.welcomes} actively welcome it. Checked on {day}; a repo
            with no policy here may still have one somewhere we didn&apos;t look.
          </>
        }
        updated={checked}
      />

      <div className="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2 lg:grid-cols-4">
        <ReportStat
          label="Written policy found"
          value={percent(policies.length, scanned)}
          note={`${policies.length} of ${scanned} GitHub repos`}
        />
        <ReportStat
          label="Require disclosure"
          value={percent(asks.disclosure, asks.total)}
          note={`${asks.disclosure} of ${asks.total} policies`}
        />
        <ReportStat
          label="Want PR text in your words"
          value={percent(asks.noAiText, asks.total)}
          note={`${asks.noAiText} policies rule out AI-written descriptions, issues or replies`}
        />
        <ReportStat
          label="Ban AI code outright"
          value={percent(counts.bans, asks.total)}
          note={`${counts.bans} of ${asks.total} policies`}
        />
      </div>

      <div className="mt-3.5 grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        <Panel className="h-full">
          <PanelHeading>Stance breakdown</PanelHeading>
          <ul className="link-list">
            {STANCES.map((s) => (
              <li
                key={s}
                className="grid min-h-11 grid-cols-[minmax(0,1fr)_90px] items-center gap-x-4 link-row sm:min-h-0"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <a href={`#${stanceAnchor(s)}`} className="cover-link">
                    <StanceChip stance={s} />
                  </a>
                  <span className="tabular-nums">
                    {counts[s]} <span className="text-muted">({percent(counts[s], asks.total)})</span>
                  </span>
                </span>
                <ReportBar part={counts[s]} total={asks.total} />
              </li>
            ))}
          </ul>
          <p className={`${PROSE} mt-4 text-[13px]`}>
            A policy that fits two stances takes the stricter one. Requiring human-written PR descriptions or replies
            counts as restricting, even where AI code is allowed.
          </p>
        </Panel>

        <Panel className="h-full">
          <PanelHeading>What most policies ask for</PanelHeading>
          <ul className="m-0 ml-5 flex list-disc flex-col gap-1.5 text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              <strong className="text-ink">Disclosure:</strong> {asks.disclosure} of {asks.total} require you to say you
              used AI, in the PR description, a label or an <code>Assisted-by</code> commit trailer.
            </li>
            <li>
              <strong className="text-ink">Your own words:</strong> {asks.noAiText} require PR descriptions, issues or
              replies to maintainers to be written by you; translation help is usually still fine.
            </li>
            <li>
              <strong className="text-ink">A human in the loop:</strong> {asks.noAutonomousAgents} explicitly refuse
              autonomous agents that open PRs or post comments on their own.
            </li>
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel tone="tip">
          <PanelHeading tone="tip" icon="pull-request">
            If you contribute with an AI agent
          </PanelHeading>
          <ol className="m-0 ml-5 flex list-decimal flex-col gap-1.5 text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              Read the repo&apos;s CONTRIBUTING file and any AI_POLICY.md before the agent writes code. Many policies
              only accept AI work for issues a maintainer has accepted.
            </li>
            <li>Disclose the tool and how much it did, in the place the policy names.</li>
            <li>Understand every line, run the tests yourself, and answer review questions in your own words.</li>
            <li>
              Point the agent at the repo&apos;s AGENTS.md, so it follows the project&apos;s conventions from the start.
            </li>
          </ol>
          <p className={`${PROSE} mt-3`}>
            See also:{" "}
            <IntentLink href={CONTRIBUTE_PATH} className="prose-link">
              projects easy for an agent to work in
            </IntentLink>
            ,{" "}
            <IntentLink href={GUIDE_PATH} className="prose-link">
              how to set an agent up
            </IntentLink>{" "}
            and{" "}
            <IntentLink href={checkPath("contributing")} className="prose-link">
              what a CONTRIBUTING guide covers
            </IntentLink>
            .
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Projects people ask about</PanelHeading>
          <ul className="m-0 ml-5 flex list-disc flex-col gap-1.5 text-[14.5px] leading-relaxed text-ink-dim">
            {namedProjects().map((n) => (
              <li key={n.label}>
                <IntentLink href={repoPath(n)} className="prose-link">
                  {n.label}
                </IntentLink>
                {n.policy ? (
                  <>
                    {" "}
                    <StanceChip stance={n.policy.stance} /> {n.policy.summary}
                  </>
                ) : (
                  <>: no AI policy in the repo&apos;s own contributing files when we checked.</>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Every policy, by stance</PanelHeading>
          <p className={`${PROSE} mb-4`}>
            Jump to{" "}
            {STANCES.map((s, i) => (
              <span key={s}>
                <a href={`#${stanceAnchor(s)}`} className="prose-link">
                  {STANCE_LABEL[s].toLowerCase()}
                </a>
                {i < STANCES.length - 1 ? ", " : "."}
              </span>
            ))}{" "}
            Summaries are ours; the linked file is the authority.
          </p>
          <AiPolicyTable policies={policies} onBoard={onBoard} />
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Methodology</PanelHeading>
          <ul className="m-0 ml-5 flex list-disc flex-col gap-1.5 text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              The sample is the {scanned} GitHub repos on the leaderboard on {day}. GitLab and Bitbucket repos
              weren&apos;t scanned.
            </li>
            <li>
              A keyword search of CONTRIBUTING and AI_POLICY.md-style files found candidates; a few large projects it
              missed were checked by hand. We read each one in full, along with any policy it links to, and dropped
              sections that aren&apos;t about AI-assisted contributions.
            </li>
            <li>Each policy was classified by hand on {day}. Policies change; the linked file is the current word.</li>
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5">
        <CiteThis title={aiPolicyTitle()} path={AI_POLICY_REPORT_PATH} asOf={day} />
      </div>
    </>
  );
}

import type { Metadata } from "next";

import { ExternalLink } from "@/components/ExternalLink";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { AI_POLICY } from "@/lib/ai-policy";
import { AUTHOR_JSON_LD } from "@/lib/author";
import { getLeaderboardStats } from "@/lib/db";
import { staticPageMetadata } from "@/lib/page-meta";
import { SIGNALS } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { WEBSITE_JSON_LD } from "@/lib/site-json-ld";
import { OWN_REPO } from "@/lib/utils/own-repo";
import { repoPath } from "@/lib/utils/repo-path";
import { AI_POLICY_REPORT_PATH } from "@/lib/utils/report-path";
import { ACTION_REPO_URL, APP_NAME, APP_URL, CONTACT_EMAIL, REPO_URL, SKILL_REPO_URL } from "@/lib/version";

export const metadata: Metadata = staticPageMetadata("/about");

const ABOUT_JSON_LD = {
  "@graph": [
    {
      ...AUTHOR_JSON_LD,
      jobTitle: "Software Engineer",
      sameAs: ["https://github.com/hsnice16", "https://x.com/hsnice16", "https://github.com/sponsors/hsnice16"],
    },
    {
      "@id": `${APP_URL}/about#page`,
      "@type": "AboutPage",
      url: `${APP_URL}/about`,
      name: `About — ${APP_NAME}`,
      author: { "@id": `${APP_URL}/about#author` },
      isPartOf: WEBSITE_JSON_LD,
      mainEntity: { "@id": `${APP_URL}/about#author` },
    },
  ],
};

export default function AboutPage() {
  const { count } = getLeaderboardStats();

  return (
    <>
      <JsonLd data={ABOUT_JSON_LD} />

      <PageHeader crumbs={{ current: { name: "About", path: "/about" } }} title={`Who builds ${APP_NAME}, and why`} />

      <Panel>
        <PanelHeading>Who</PanelHeading>
        <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
          Built and maintained by <ExternalLink href="https://github.com/hsnice16">Himanshu Singh</ExternalLink>, a
          software engineer who builds side projects in the open. X:{" "}
          <ExternalLink href="https://x.com/hsnice16">@hsnice16</ExternalLink>.
        </p>
        <p className="mt-3 mb-0 text-[14.5px] leading-relaxed text-ink-dim">
          Independent: not tied to Anthropic, OpenAI, Google, Cognition, Anysphere, or any other company whose agent is
          scored here.
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>The work behind it</PanelHeading>
          <ul className="m-0 ml-5 list-disc text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              A scorer of {SIGNALS.length} file checks, weighted for each of {MODELS.length} agents from that
              agent&apos;s own docs. The{" "}
              <IntentLink href="/methodology#agents" className="prose-link">
                methodology
              </IntentLink>{" "}
              links the docs behind each weight.
            </li>
            <li>
              {count} repos, rescored daily. Every score is committed to the repo, so its git history shows how each one
              changed.
            </li>
            <li>
              {AI_POLICY.policies.length} written AI contribution policies, found in {AI_POLICY.scanned} repos and each
              read and sorted into one of five stances, in the{" "}
              <IntentLink href={AI_POLICY_REPORT_PATH} className="prose-link">
                AI contribution policy report
              </IntentLink>
              .
            </li>
            <li>
              The same scorer runs in a <ExternalLink href={ACTION_REPO_URL}>GitHub Action</ExternalLink> that comments
              score changes on pull requests, and in an <ExternalLink href={SKILL_REPO_URL}>agent skill</ExternalLink>{" "}
              that scores a repo on disk.
            </li>
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Why it exists</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            A README alone doesn&apos;t help an AI coding agent get work done, and nothing public showed which repos do
            more. {APP_NAME} shows it per agent, because agents read different files: Claude Code loads CLAUDE.md,
            Cursor its own rules and AGENTS.md, and Devin needs a dev setup it can run.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>What it is not</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            Not a test of how well agents perform. Scores come from <strong className="text-ink">file checks</strong>,
            and no agent is run. Weights follow each agent&apos;s docs but aren&apos;t yet measured against real runs.
            The{" "}
            <IntentLink href="/methodology" className="prose-link">
              methodology
            </IntentLink>{" "}
            has the plan to measure them.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>How repos are chosen</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            The leaderboard is a curated list of {count} public repos on GitHub, GitLab and Bitbucket, kept in{" "}
            <ExternalLink href={`${REPO_URL}/blob/main/scripts/seed-list.ts`}>scripts/seed-list.ts</ExternalLink> and
            grouped by ecosystem: JavaScript and TypeScript, Python, Rust, Go, the JVM, other languages, and AI coding
            agents, models and SDKs. Rescored daily; a repo taken off the list leaves the leaderboard at the next
            rescore.
          </p>
          <p className="mt-3 mb-0 text-[14.5px] leading-relaxed text-ink-dim">
            A weekly audit flags listed repos that were renamed, archived, deleted or made private, are forks or
            mirrors, or whose score stopped refreshing; each is fixed or accepted on purpose. Scoring a repo with{" "}
            <IntentLink href="/score" className="prose-link">
              Live Score
            </IntentLink>{" "}
            never adds it. To suggest one, open an issue or a pull request that edits the list.
          </p>
          <p className="mt-3 mb-0 text-[14.5px] leading-relaxed text-ink-dim">
            This site&apos;s own repo,{" "}
            <IntentLink href={repoPath(OWN_REPO)} className="prose-link">
              {OWN_REPO.owner}/{OWN_REPO.name}
            </IntentLink>
            , and the author&apos;s other repos are listed and scored by the same rules, labelled &ldquo;this
            site&apos;s own repo&rdquo; and &ldquo;by this site&apos;s author&rdquo; wherever repos are listed.
          </p>
        </Panel>
      </div>

      <div id="how-its-made" className="mt-3.5 scroll-mt-20">
        <Panel>
          <PanelHeading>How this site is made</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            <strong className="text-ink">Scores</strong> come from the open-source scorer reading each repo&apos;s
            files: a shallow clone of its default branch, with stars, language and description from the GitHub, GitLab
            or Bitbucket API. The same files always get the same score. A scheduled GitHub Actions job rescores the
            board and commits the results.
          </p>
          <p className="mt-3 mb-0 text-[14.5px] leading-relaxed text-ink-dim">
            <strong className="text-ink">No language model runs on the site.</strong> None scores a repo, writes page
            text at build time or answers a visitor.
          </p>
          <p className="mt-3 mb-0 text-[14.5px] leading-relaxed text-ink-dim">
            <strong className="text-ink">Code and writing</strong>: the maintainer builds the site, guides and reports
            with Claude Code, Anthropic&apos;s coding agent, which drafts and edits code and copy and checks claims
            against agents&apos; docs. Most commits name it as co-author. Claude Code is also scored here, weighted from
            its docs like every other agent.
          </p>
          <p className="mt-3 mb-0 text-[14.5px] leading-relaxed text-ink-dim">
            <strong className="text-ink">Curated, not computed</strong>: the{" "}
            <ExternalLink href={`${REPO_URL}/blob/main/scripts/seed-list.ts`}>repo list</ExternalLink> and the{" "}
            <ExternalLink href={`${REPO_URL}/blob/main/data/ai-policy.json`}>AI policy stances</ExternalLink>. Both are
            plain files in the repo, so every entry can be checked.
          </p>
          <p className="mt-3 mb-0 text-[14.5px] leading-relaxed text-ink-dim">
            <strong className="text-ink">Corrections</strong>: open an{" "}
            <ExternalLink href={`${REPO_URL}/issues`}>issue</ExternalLink> with a link to what&apos;s wrong. Fixes land
            as public commits, so what changed and when stays visible.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Open source</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            MIT-licensed. The checks, weights, scoring code, repo list and every score are in the{" "}
            <ExternalLink href={REPO_URL}>source repository</ExternalLink>. If a score looks wrong, open an issue with a
            link and the rule in question. Missing a check? Suggest one.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Contact</PanelHeading>

          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            Open an issue or discussion on <ExternalLink href={`${REPO_URL}/issues`}>GitHub</ExternalLink>. For anything
            private, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="prose-link">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Panel>
      </div>
    </>
  );
}

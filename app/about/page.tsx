import type { Metadata } from "next";
import Link from "next/link";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { ExternalLink } from "@/components/ExternalLink";
import { JsonLd } from "@/components/JsonLd";
import { Panel, PanelHeading } from "@/components/Panel";
import { AUTHOR_JSON_LD } from "@/lib/author";
import { getLeaderboardStats } from "@/lib/db";
import { staticPageMetadata } from "@/lib/page-meta";
import { OWN_REPO } from "@/lib/utils/own-repo";
import { repoPath } from "@/lib/utils/repo-path";
import { APP_NAME, APP_URL, CONTACT_EMAIL, REPO_URL } from "@/lib/version";

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
      isPartOf: { "@id": `${APP_URL}/#site` },
      mainEntity: { "@id": `${APP_URL}/about#author` },
    },
  ],
};

export default function AboutPage() {
  const { count } = getLeaderboardStats();

  return (
    <>
      <BreadcrumbJsonLd current={{ name: "About", path: "/about" }} />

      <JsonLd data={ABOUT_JSON_LD} />

      <section className="my-3 mb-7">
        <h1 className="m-0 text-[30px] font-bold leading-[1.18] tracking-tight">Who builds {APP_NAME}, and why</h1>
      </section>

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
        <Panel tone="warn">
          <PanelHeading tone="warn">Why it exists</PanelHeading>
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
            <Link
              href="/methodology"
              className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              methodology
            </Link>{" "}
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
            agents, models and SDKs. It is rescored every six hours; a repo taken off the list leaves the leaderboard at
            the next rescore.
          </p>
          <p className="mt-3 mb-0 text-[14.5px] leading-relaxed text-ink-dim">
            A weekly audit flags repos on the list that were renamed, archived, deleted or made private, that are forks
            or mirrors, or whose score stopped refreshing; each is fixed or accepted on purpose. Scoring a repo with{" "}
            <Link
              href="/score"
              className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              Live Score
            </Link>{" "}
            never adds it. To suggest one, open an issue or a pull request that edits the list.
          </p>
          <p className="mt-3 mb-0 text-[14.5px] leading-relaxed text-ink-dim">
            This site&apos;s own repo,{" "}
            <Link
              href={repoPath(OWN_REPO)}
              className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              {OWN_REPO.owner}/{OWN_REPO.name}
            </Link>
            , and the author&apos;s other repos are on the list and scored by the same rules. They are labelled
            &ldquo;this site&apos;s own repo&rdquo; and &ldquo;by this site&apos;s author&rdquo; wherever repos are
            listed.
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
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Panel>
      </div>
    </>
  );
}

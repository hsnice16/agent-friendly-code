import type { Metadata } from "next";

import { ActionEmbed } from "@/components/ActionEmbed";
import { ExternalLink } from "@/components/ExternalLink";
import { JsonLd } from "@/components/JsonLd";
import { Panel, PanelHeading } from "@/components/Panel";
import { PAGE_COPY, staticPageMetadata } from "@/lib/page-meta";
import { ACTION_REPO_URL, ACTION_USES, APP_URL } from "@/lib/version";

export const metadata: Metadata = staticPageMetadata("/action");

const FAQ = [
  {
    q: "What does the action do on a pull request?",
    a: "Scores the pull request and its target branch, then posts one comment with how the overall score, each check and each agent's score changed. Later pushes update that comment.",
  },
  {
    q: "Is it an AI code reviewer?",
    a: "No. It calls no model and reviews no code. It checks the files agents rely on, like AGENTS.md, tests and CI config.",
  },
  {
    q: "Why is AGENTS_BADGE_TOKEN required?",
    a: "It's an on switch, not a password. Any value turns the comment on; unset, the action does nothing, so template repos can ship the workflow without it running in every copy.",
  },
  {
    q: "Does it contact this website?",
    a: "No. The scorer and weights are bundled into the action, so it works even if this site is down.",
  },
  {
    q: "Does it work on private repos?",
    a: "Yes. Scoring runs on the CI machine and your code is never sent anywhere. The comment uses the workflow's own GITHUB_TOKEN.",
  },
  {
    q: "How do I pin a version?",
    a: "@v0 follows the latest 0.x release; an exact tag such as @v0.1.0 stays on one version.",
  },
];

const FAQ_JSON_LD = {
  "@type": "FAQPage",
  mainEntity: FAQ.map((entry) => ({
    "@type": "Question",
    name: entry.q,
    acceptedAnswer: { "@type": "Answer", text: entry.a },
  })),
};

const APPLICATION_JSON_LD = {
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${APP_URL}/` },
        { "@type": "ListItem", position: 2, name: "GitHub Action", item: `${APP_URL}/action` },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${APP_URL}/action#app`,
      url: ACTION_REPO_URL,
      operatingSystem: "Linux",
      isAccessibleForFree: true,
      description: PAGE_COPY["/action"].description,
      name: "Agent Friendly Action",
      publisher: { "@id": `${APP_URL}/#org` },
      applicationCategory: "DeveloperApplication",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      softwareRequirements: "GitHub Actions, Node.js 24",
      license: "https://opensource.org/licenses/MIT",
    },
  ],
};

export default function ActionPage() {
  return (
    <>
      <JsonLd data={APPLICATION_JSON_LD} />
      <JsonLd data={FAQ_JSON_LD} />

      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">
          Agent Friendly Action: score every pull request
        </h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          Comments on every pull request with how it changes your score for each agent, for example &ldquo;this PR drops
          your Claude Code score by 4.1 points because it removed CI config&rdquo;. It runs in your CI, and one secret
          turns it on.
        </p>
      </section>

      <ActionEmbed actionUses={ACTION_USES} highlight="warn" />

      <div id="set-secret" className="mt-3.5 scroll-mt-20">
        <Panel>
          <PanelHeading>Set the AGENTS_BADGE_TOKEN secret</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            The action runs only when{" "}
            <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
              AGENTS_BADGE_TOKEN
            </code>{" "}
            is set:
          </p>

          <ol className="m-0 ml-5 mt-3 list-decimal text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              In your repo, open <strong className="text-ink">Settings → Secrets and variables → Actions</strong>.
            </li>
            <li>
              Click <strong className="text-ink">New repository secret</strong>.
            </li>
            <li>
              Name:{" "}
              <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
                AGENTS_BADGE_TOKEN
              </code>
              . Value: any text, for example{" "}
              <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
                enabled
              </code>
              . The value isn&apos;t read.
            </li>
            <li>
              Click <strong className="text-ink">Add secret</strong>. The action runs on your next pull request.
            </li>
          </ol>

          <p className="mt-3 text-[13px] text-muted">
            GitHub&apos;s guide:{" "}
            <ExternalLink href="https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets">
              docs.github.com — using secrets
            </ExternalLink>
            .
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>How it works</PanelHeading>
          <ol className="m-0 ml-5 list-decimal text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
                actions/checkout
              </code>{" "}
              with <code className="text-ink-dim">fetch-depth: 0</code> gives the action the pull request and its target
              branch's history.
            </li>

            <li>It scores both with the same weights, fetching the target commit if it is missing.</li>

            <li>
              It posts or updates one comment, marked with{" "}
              <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
                {"<!-- agent-friendly-action -->"}
              </code>
              .
            </li>
          </ol>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>FAQ</PanelHeading>

          <ul className="m-0 list-none p-0">
            {FAQ.map((entry) => (
              <li key={entry.q} className="border-b border-line py-3 last:border-b-0">
                <div className="text-[14.5px] font-medium text-ink">{entry.q}</div>
                <p className="m-0 mt-1 text-[13.5px] leading-relaxed text-ink-dim">{entry.a}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Source</PanelHeading>

          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            <ExternalLink href={ACTION_REPO_URL} iconSize={12}>
              {ACTION_REPO_URL.replace(/^https:\/\//, "")}
            </ExternalLink>{" "}
            — MIT-licensed. Listed on the{" "}
            <ExternalLink href="https://github.com/marketplace/actions/agent-friendly-score-diff">
              GitHub Marketplace
            </ExternalLink>{" "}
            under Code Quality / Continuous Integration.
          </p>
        </Panel>
      </div>
    </>
  );
}

import type { Metadata } from "next";

import { ActionEmbed } from "@/components/ActionEmbed";
import { ExternalLink } from "@/components/ExternalLink";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { PAGE_COPY, staticPageMetadata } from "@/lib/page-meta";
import { PUBLISHER_JSON_LD } from "@/lib/site-json-ld";
import { ACTION_REPO_URL, ACTION_USES, APP_URL } from "@/lib/version";

import { ACTION_FAQ } from "./faq";

export const metadata: Metadata = staticPageMetadata("/action");

const APPLICATION_JSON_LD = {
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${APP_URL}/action#app`,
      url: ACTION_REPO_URL,
      operatingSystem: "Linux",
      isAccessibleForFree: true,
      description: PAGE_COPY["/action"].description,
      name: "Agent Friendly Action",
      publisher: PUBLISHER_JSON_LD,
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

      <PageHeader
        crumbs={{ current: { name: "GitHub Action", path: "/action" } }}
        title="Agent Friendly Action: score every pull request"
        lead={
          <>
            Comments on every pull request with how it changes your score for each agent, for example &ldquo;this PR
            drops your Claude Code score by 4.1 points because it removed CI config&rdquo;. It runs in your CI, and one
            secret turns it on.
          </>
        }
      />

      <ActionEmbed actionUses={ACTION_USES} highlight="tip" />

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
        <FaqSection heading="FAQ" items={ACTION_FAQ} />
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

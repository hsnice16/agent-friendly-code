import type { Metadata } from "next";

import { ActionEmbed } from "@/components/ActionEmbed";
import { ExternalLink } from "@/components/ExternalLink";
import { Panel, PanelHeading } from "@/components/Panel";
import {
  ACTION_REPO_URL,
  ACTION_USES,
  APP_KEYWORDS,
  APP_NAME,
  APP_URL,
  DEFAULT_OG_IMAGE,
  OG_DEFAULTS,
  TWITTER_DEFAULTS,
} from "@/lib/version";

const PAGE_TITLE = "GitHub Action: score every pull request";
const PAGE_DESCRIPTION =
  "A GitHub Action that comments on each pull request with how it changes the repo's score for each AI coding agent. Opt-in, and it runs only in your CI.";

const PAGE_KEYWORDS = [
  ...APP_KEYWORDS,
  "pr score check",
  "score diff on pr",
  "github action ai",
  "ai code agent ci",
  "agents.md ci check",
  "pr score regression",
  "agent friendly action",
  "ai readiness github action",
  "github action agent friendly",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  keywords: PAGE_KEYWORDS,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/action" },
  twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  openGraph: {
    ...OG_DEFAULTS,
    images: [DEFAULT_OG_IMAGE],
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/action",
    type: "article",
  },
};

const FAQ = [
  {
    q: "What does the action do on a pull request?",
    a: "It runs in your own CI, with no outside server involved. It scores the pull request and the branch it targets, then posts one comment showing how the overall score changed and which checks changed. On the next push it updates that same comment instead of adding a new one.",
  },
  {
    q: "Why is AGENTS_BADGE_TOKEN required?",
    a: "It's an on switch, not a password or API key. Set it to any text to turn the comment on. Leave it unset and the action quietly does nothing. This lets template and starter repos include the workflow without it running in every fork or copy.",
  },
  {
    q: "Does it contact this website?",
    a: "No. The scoring code and weights are packed into the action itself (its dist folder, built with @vercel/ncc). If this site goes offline, the action keeps working the same way.",
  },
  {
    q: "Does it work on private repos?",
    a: "Yes. It runs in your CI with your existing GITHUB_TOKEN. The action never sends your code anywhere. All scoring happens on the CI machine.",
  },
  {
    q: "Where is the source?",
    a: "github.com/hsnice16/agent-friendly-action. It's MIT-licensed and uses version tags. Use @v0 to always get the latest 0.x release. Use @v0.1.0 to stay on one exact version with no automatic updates.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((entry) => ({
    "@type": "Question",
    name: entry.q,
    acceptedAnswer: { "@type": "Answer", text: entry.a },
  })),
};

const APPLICATION_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${APP_URL}/` },
        { "@type": "ListItem", position: 2, name: "Action", item: `${APP_URL}/action` },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${APP_URL}/action#app`,
      url: ACTION_REPO_URL,
      operatingSystem: "Linux",
      isAccessibleForFree: true,
      description: PAGE_DESCRIPTION,
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
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: server-built JSON-LD; `<` is escaped
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(APPLICATION_JSON_LD).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: server-built JSON-LD; `<` is escaped
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(FAQ_JSON_LD).replace(/</g, "\\u003c"),
        }}
      />

      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">
          Agent Friendly Action: score every pull request
        </h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          A GitHub Action that comments on every pull request with how it changes your score. For example: &ldquo;this
          PR drops your Claude Code score by 4.1 points because it removed CI config&rdquo;. It runs only in your CI,
          with no outside server, and you turn it on with one secret.
        </p>
      </section>

      <ActionEmbed actionUses={ACTION_USES} highlight="warn" />

      <div id="set-secret" className="mt-3.5 scroll-mt-20">
        <Panel>
          <PanelHeading>Set the AGENTS_BADGE_TOKEN secret</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            The action only fires when{" "}
            <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
              AGENTS_BADGE_TOKEN
            </code>{" "}
            is set. It&apos;s an on switch, not a password. Add it once and you&apos;re done:
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
              </code>{" "}
              . The value itself isn&apos;t checked.
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
              with <code className="text-ink-dim">fetch-depth: 0</code> gives the action the pull request and the
              history of the branch it targets.
            </li>

            <li>
              The action checks out the target branch from that history, fetching just that commit if it is missing. No
              full clone.
            </li>
            <li>It scores both versions and works out what changed: overall, for each check, and for each agent.</li>

            <li>
              It posts one comment on the pull request (or updates it), marked with{" "}
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
          <PanelHeading>Works on its own</PanelHeading>

          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            The scoring code and weights are packed into{" "}
            <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
              dist/
            </code>{" "}
            via{" "}
            <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
              @vercel/ncc
            </code>
            . If {APP_NAME} goes offline tomorrow, the action keeps working the same way. Both versions are scored with
            the same weights, so the comparison stays fair.
          </p>
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
            — MIT-licensed, with version tags. Listed on the{" "}
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

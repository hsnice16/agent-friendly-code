import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { ActionEmbed } from "@/components/ActionEmbed";
import { Panel, PanelHeading } from "@/components/Panel";
import { ACTION_REPO_URL, ACTION_USES, APP_KEYWORDS, APP_NAME, APP_URL } from "@/lib/version";

const PAGE_TITLE = "Agent Friendly Action — PR-diff GitHub Action for AI agent-friendliness";
const PAGE_DESCRIPTION =
  "GitHub Action that scores your PR's head and base in CI and posts a single comment with the agent-friendliness delta — Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Aider, OpenHands, Pi. Opt-in, Marketplace-listed, runs entirely inside your CI.";

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
  twitter: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: "/action", type: "article" },
};

const FAQ = [
  {
    q: "What does the action do on a PR?",
    a: "It runs inside your CI (no third-party server in the loop), checks out the PR head and the base ref, scores both trees with the bundled scorer, and posts a single PR comment with the overall delta plus per-signal changes. On the next push it edits that same comment instead of creating a new one.",
  },
  {
    q: "Why is AGENTS_BADGE_TOKEN required?",
    a: "It's an opt-in marker, not an API credential. Set it (any non-empty string) to enable the comment; leave it unset and the action exits silently. This lets template / starter repos ship the workflow without it firing for forks or unenrolled installs.",
  },
  {
    q: "Does it talk to your web app?",
    a: "No. The scorer and weights are bundled into the action's dist via @vercel/ncc. If this dashboard goes offline, the action keeps producing PR comments unchanged. A future version will optionally fetch fresh weights from /api/weights once benchmark-derived weights ship (1.0.0).",
  },
  {
    q: "Does it work on private repos?",
    a: "Yes — it runs in your CI under your existing GITHUB_TOKEN. The action never sends repo contents anywhere; the scoring is local to the runner.",
  },
  {
    q: "Where is the source?",
    a: "github.com/hsnice16/agent-friendly-action. MIT-licensed, semver-tagged. Pin @v0 to track the latest 0.x release; pin @v0.1.0 to opt out of automatic minor / patch updates.",
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
      softwareRequirements: "GitHub Actions, Node.js 20",
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
          Agent Friendly Action — score every PR
        </h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          A GitHub Action that comments the agent-friendliness delta on every pull request — &ldquo;this PR drops your
          Claude Code score by 4.1 points because it removed CI config&rdquo;. Runs entirely inside your CI, no
          third-party server, opt-in via a single secret.
        </p>
      </section>

      <Panel>
        <PanelHeading>How it works</PanelHeading>
        <ol className="m-0 ml-5 list-decimal text-[14.5px] leading-relaxed text-ink-dim">
          <li>
            <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
              actions/checkout
            </code>{" "}
            with <code className="text-ink-dim">fetch-depth: 0</code> gives the action the PR head and access to base
            history.
          </li>

          <li>The action fetches the base ref locally and checks it out into a worktree — no network clone.</li>
          <li>Scores both trees with the bundled scorer and computes the overall + per-signal + per-model delta.</li>

          <li>
            Posts (or edits) a single PR comment marked with{" "}
            <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
              {"<!-- agent-friendly-action -->"}
            </code>
            .
          </li>
        </ol>
      </Panel>

      <div className="mt-3.5">
        <ActionEmbed actionUses={ACTION_USES} />
      </div>

      <div id="set-secret" className="mt-3.5 scroll-mt-20">
        <Panel>
          <PanelHeading>Set the AGENTS_BADGE_TOKEN secret</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            The action only fires when{" "}
            <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
              AGENTS_BADGE_TOKEN
            </code>{" "}
            is present — it&apos;s an opt-in marker, not a credential. Add it once and forget it:
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
              . Value: any non-empty string —{" "}
              <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
                enabled
              </code>{" "}
              works. The string itself isn&apos;t checked.
            </li>
            <li>
              Click <strong className="text-ink">Add secret</strong>. The action fires on the next PR.
            </li>
          </ol>

          <p className="mt-3 text-[13px] text-muted">
            Authoritative reference:{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.github.com/en/actions/security-guides/encrypted-secrets"
              className="inline-flex items-center gap-0.5 border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              docs.github.com — encrypted secrets <ArrowUpRight size={11} weight="bold" aria-hidden="true" />
            </a>
            .
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Self-contained by design</PanelHeading>

          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            The scorer and weights are bundled into{" "}
            <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
              dist/
            </code>{" "}
            via{" "}
            <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
              @vercel/ncc
            </code>
            . If {APP_NAME} goes offline tomorrow, the action keeps producing PR comments unchanged. Runtime weight
            refresh from a future{" "}
            <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
              /api/weights
            </code>{" "}
            endpoint is deferred to v1.0.0 once benchmark-derived weights ship — until then both the head and the base
            are scored with the same bundled weights, so any drift cancels in the diff.
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
            <a
              target="_blank"
              href={ACTION_REPO_URL}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              {ACTION_REPO_URL.replace(/^https:\/\//, "")} <ArrowUpRight size={12} weight="bold" aria-hidden="true" />
            </a>{" "}
            — MIT-licensed, semver-tagged. Listed on the GitHub Marketplace under Code Quality / Continuous Integration.
          </p>
        </Panel>
      </div>
    </>
  );
}

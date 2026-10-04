import type { Metadata } from "next";
import Link from "next/link";

import { LiveScoreForm } from "@/components/LiveScoreForm";
import { Panel, PanelHeading } from "@/components/Panel";
import { RecentScores } from "@/components/RecentScores";
import { listLeaderboardOverall } from "@/lib/db";
import { APP_KEYWORDS, APP_URL, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const PAGE_TITLE = "Live Score — check how ready any GitHub repo is for AI coding agents";
const PAGE_DESCRIPTION =
  "Paste a link to any public GitHub repo and see how ready it is for AI coding agents: one overall score, a score for each agent (Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Kimi CLI, Aider, OpenHands, Pi), and what to fix first. Uses the latest commit. No sign-up, and nothing is saved.";

const PAGE_KEYWORDS = [
  ...APP_KEYWORDS,
  "score a repo",
  "live repo score",
  "score any github repo",
  "check repo ai readiness",
  "agent friendliness checker",
  "is my repo agent friendly",
  "AGENTS.md checker",
  "repo agent readiness test",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  keywords: PAGE_KEYWORDS,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/score" },
  twitter: { ...TWITTER_DEFAULTS, title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  openGraph: { ...OG_DEFAULTS, title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: "/score", type: "website" },
};

type FaqEntry = {
  q: string;
  a: string;
  /** Turns one phrase of `a` into a link. `a` stays the plain-text source the JSON-LD needs. */
  link?: { phrase: string; href: string };
};

const FAQ: FaqEntry[] = [
  {
    q: "Does the repo have to be on the leaderboard?",
    a: "No. That is what this page is for. Paste a link to any public GitHub repo and we score it right away, even if we have never seen it before. If the repo is already on the leaderboard, we send you to its own page instead. It has the same numbers, plus how the score changed over time.",
  },
  {
    q: "Is this score different from the leaderboard score?",
    a: "No. Both use the same checks and the same weights. Only the way we get the files is different. The leaderboard downloads each repo every six hours. This page rebuilds the repo from GitHub's file list when you ask. An automated test checks that both ways give the same numbers, using sample repos picked to catch any difference.",
  },
  {
    q: "Do you save or list my repo anywhere?",
    a: "No. We work out the score, show it, and throw it away. Nothing about the repo goes into our database, and scoring a repo never adds it to the public leaderboard. Search engines are told not to show the result page. The list of repos you scored stays in your own browser and is never sent anywhere.",
  },
  {
    q: "How up to date is the score?",
    a: "It uses the repo's latest commit, and the page shows which commit it used. We keep each result for an hour, so a change you pushed a few minutes ago may not show up until that hour is over.",
  },
  {
    q: "Does it work on private repos, GitLab, or Bitbucket?",
    a: "Only public GitHub repos for now. Private repos would need access we choose not to ask for. GitLab and Bitbucket already work and give the same scores, but we are holding them back until we can stay within their limits: GitLab returns only 100 items per request, and Bitbucket allows 60 requests an hour without a login. To score a private repo today, run the agent skill on your own computer.",
    link: { phrase: "the agent skill", href: "/skill" },
  },
  {
    q: "Why won't a very large repo get a score?",
    a: "Rebuilding a repo with more than 150,000 files and folders takes longer than a page is allowed to run. So above a set size, we stop and say so, rather than time out or give a half-finished score. The agent skill can score these on your own computer, with no size limit.",
    link: { phrase: "The agent skill", href: "/skill" },
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${APP_URL}/` },
        { "@type": "ListItem", position: 2, name: "Live Score", item: `${APP_URL}/score` },
      ],
    },
    {
      "@type": "WebApplication",
      "@id": `${APP_URL}/score#app`,
      url: `${APP_URL}/score`,
      name: "Live Score",
      isAccessibleForFree: true,
      description: PAGE_DESCRIPTION,
      publisher: { "@id": `${APP_URL}/#org` },
      operatingSystem: "Any",
      applicationCategory: "DeveloperApplication",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      browserRequirements: "Requires JavaScript-enabled modern browser",
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((entry) => ({
        "@type": "Question",
        name: entry.q,
        acceptedAnswer: { "@type": "Answer", text: entry.a },
      })),
    },
  ],
};

// Splitting the rendered answer rather than storing a second, marked-up copy:
// the JSON-LD needs plain text, and two copies of the same sentence is one copy
// too many. A phrase that stops matching degrades to plain text, not a crash.
function Answer({ entry }: { entry: FaqEntry }) {
  const at = entry.link ? entry.a.indexOf(entry.link.phrase) : -1;
  if (!entry.link || at === -1) return <>{entry.a}</>;

  return (
    <>
      {entry.a.slice(0, at)}
      <Link
        href={entry.link.href}
        className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
      >
        {entry.link.phrase}
      </Link>
      {entry.a.slice(at + entry.link.phrase.length)}
    </>
  );
}

const EXAMPLES_SHOWN = 10;

export default function ScoreIndexPage() {
  // Shown alongside the visitor's own scores, not replaced by them — otherwise
  // the curated list vanishes the moment someone scores anything.
  const examples = listLeaderboardOverall().slice(0, EXAMPLES_SHOWN);

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: server-built JSON-LD; `<` is escaped
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c"),
        }}
      />

      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">Live Score</h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          Paste a link to a public GitHub repo. You get a score based on what an AI agent can find, read, and run in it,
          using the same numbers as the leaderboard. We score the latest commit right away, and save nothing.
        </p>

        <LiveScoreForm />

        <p className="mt-3 text-[13px] text-muted">GitLab and Bitbucket are coming soon.</p>
      </section>

      <RecentScores
        past={examples.map((r) => ({ id: r.id, host: r.host, owner: r.owner, name: r.name, score: r.score ?? 0 }))}
      />

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Questions</PanelHeading>

          <dl className="m-0">
            {FAQ.map((entry) => (
              <div key={entry.q} className="border-b border-line py-3.5 last:border-b-0 last:pb-0">
                <dt className="m-0 text-[14.5px] font-semibold text-ink">{entry.q}</dt>
                <dd className="m-0 mt-1.5 text-[14px] leading-relaxed text-ink-dim">
                  <Answer entry={entry} />
                </dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </>
  );
}

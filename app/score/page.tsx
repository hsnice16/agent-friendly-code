import type { Metadata } from "next";
import Link from "next/link";

import { LiveScoreForm } from "@/components/LiveScoreForm";
import { Panel, PanelHeading } from "@/components/Panel";
import { RecentScores } from "@/components/RecentScores";
import { listLeaderboardOverall } from "@/lib/db";
import { APP_KEYWORDS, APP_URL, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const PAGE_TITLE = "Live Score — on-demand AI agent-friendliness check for any GitHub repository";
const PAGE_DESCRIPTION =
  "Paste any public GitHub repository URL and get its agent-friendliness score on demand — overall, per model (Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Kimi CLI, Aider, OpenHands, Pi), with the gaps worth fixing first. Scored from the current commit, no sign-up, nothing stored.";

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
    a: "No — that is the point of this page. Paste any public GitHub repository URL and it is scored on the spot, whether or not we have ever indexed it. Repos already on the leaderboard redirect to their permanent page instead, which carries the same numbers plus score history.",
  },
  {
    q: "How is this different from the leaderboard's own scores?",
    a: "It is not. Both run the same scorer over the same signals and weights; they differ only in how the files get there. The leaderboard clones each repo on a six-hourly cron, while this page reconstructs the repository from GitHub's tree API at request time. A CI job asserts the two produce identical numbers on a fixture set chosen for the ways they could disagree.",
  },
  {
    q: "Is my repository stored or listed anywhere?",
    a: "No. A live score is computed, rendered, and discarded — nothing about the repository is written to the database, and scoring a repo never adds it to the public leaderboard. The result page is marked noindex, so it will not turn up in search. The list of repos you have scored is kept in your own browser and never sent anywhere.",
  },
  {
    q: "How fresh is the score?",
    a: "It is computed from the repository's current commit, and the page shows the short SHA it used. Results are cached per URL for an hour, so a push made minutes ago may not be reflected until the cache turns over.",
  },
  {
    q: "Does it work on private repos, GitLab, or Bitbucket?",
    a: "Public GitHub repositories only, for now. Private repos would need authorization we deliberately do not ask for. GitLab and Bitbucket are implemented and score identically to a clone, but are held back until their API limits are guarded — GitLab paginates its tree at 100 entries and Bitbucket allows 60 unauthenticated requests an hour. To score a private repo today, run the agent skill locally instead.",
    link: { phrase: "the agent skill", href: "/skill" },
  },
  {
    q: "Why did a very large repository refuse to score?",
    a: "Reconstructing a tree of several hundred thousand entries would take longer than a request can run, so past a ceiling the page declines rather than timing out or returning a partial score. The agent skill scores those locally with no such limit.",
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
          Paste a public GitHub repository URL for a score based on what an agent can find, read, and run in it — the
          same numbers the leaderboard uses. Scored on the spot from the current commit, and stored nowhere.
        </p>

        <LiveScoreForm />

        <p className="mt-3 text-[13px] text-muted">GitLab and Bitbucket support coming.</p>
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
                <dd className="m-0 mt-1.5 max-w-[72ch] text-[14px] leading-relaxed text-ink-dim">
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

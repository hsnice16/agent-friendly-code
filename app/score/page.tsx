import type { Metadata } from "next";
import Link from "next/link";

import { CheckChecklist } from "@/components/CheckChecklist";
import { JsonLd } from "@/components/JsonLd";
import { LiveScoreForm } from "@/components/LiveScoreForm";
import { Panel, PanelHeading } from "@/components/Panel";
import { RecentScores } from "@/components/RecentScores";
import { getCheckStats } from "@/lib/check-stats";
import { listLeaderboardOverall } from "@/lib/db";
import { PAGE_COPY, staticPageMetadata } from "@/lib/page-meta";
import { SIGNALS } from "@/lib/scoring/signals";
import { APP_NAME, APP_URL, OG_IMAGE_SIZE } from "@/lib/version";

const OG_IMAGE = {
  url: "/og/score",
  ...OG_IMAGE_SIZE,
  alt: `${APP_NAME} — Live Score: any public GitHub repo, on demand`,
};

export const metadata: Metadata = staticPageMetadata("/score", OG_IMAGE);

type FaqEntry = {
  q: string;
  a: string;
  /** Turns one phrase of `a` into a link. `a` stays the plain-text source the JSON-LD needs. */
  link?: { phrase: string; href: string };
};

const FAQ: FaqEntry[] = [
  {
    q: "Which AI coding agent should I use for my codebase?",
    a: "This page tells you which agent your repo is best set up for, not which writes the best code. Each agent reads different files (Claude Code loads CLAUDE.md, Cursor its rules files), so you get a score and fixes for each.",
  },
  {
    q: "Does the repo have to be on the leaderboard?",
    a: "No. Any public GitHub repo is scored right away. One already on the leaderboard opens its page, which also shows how the score changed since the last rescore.",
  },
  {
    q: "Is this score different from the leaderboard score?",
    a: "No. Same checks, same weights. The leaderboard clones each repo daily; this page rebuilds it from GitHub's file list, and a test checks both give the same numbers.",
  },
  {
    q: "Do you save or list my repo anywhere?",
    a: "No. The result is cached for up to an hour, then dropped. Nothing goes into our database or onto the leaderboard, and search engines are told not to index it. Your list of scored repos stays in your browser.",
  },
  {
    q: "How up to date is the score?",
    a: "It scores the latest commit and shows which one. Results are cached for an hour, so a very recent push may not show yet.",
  },
  {
    q: "Does it work on private repos, GitLab, or Bitbucket?",
    a: "Only public GitHub repos for now. Private repos would need access we choose not to ask for. GitLab and Bitbucket work but are held back by API limits: GitLab returns 100 items per request, Bitbucket allows 60 requests an hour without a login. For a private repo, run the agent skill locally.",
    link: { phrase: "the agent skill", href: "/skill" },
  },
  {
    q: "Why won't a very large repo get a score?",
    a: "Past 150,000 files and folders, rebuilding a repo takes longer than a page may run, so we say so rather than give a partial score. The agent skill scores it locally, with no size limit.",
    link: { phrase: "The agent skill", href: "/skill" },
  },
];

const JSON_LD = {
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
      description: PAGE_COPY["/score"].description,
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
      <JsonLd data={JSON_LD} />

      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">
          Is your repo ready for AI coding agents?
        </h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          Paste a public GitHub repo link to get a score for each agent and the one the repo is best set up for. Same
          checks and weights as the leaderboard; nothing is saved.
        </p>

        <LiveScoreForm />

        <p className="mt-3 text-[13px] text-muted">GitLab and Bitbucket are coming soon.</p>
      </section>

      <RecentScores
        past={examples.map((r) => ({ id: r.id, host: r.host, owner: r.owner, name: r.name, score: r.score ?? 0 }))}
      />

      <div className="mt-3.5">
        <CheckChecklist rows={SIGNALS.map((s) => ({ id: s.id, label: s.label, ...getCheckStats(s.id) }))} />
      </div>

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

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { CheckRepoList } from "@/components/CheckRepoList";
import { CodeText } from "@/components/CodeText";
import { JsonLd } from "@/components/JsonLd";
import { Panel, PanelHeading } from "@/components/Panel";
import { CHECK_CONTENT, CHECK_QUESTIONS } from "@/lib/check-content";
import { fullRate, getCheckStats } from "@/lib/check-stats";
import { getLeaderboardStats } from "@/lib/db";
import { SIGNAL_BY_ID, SIGNALS } from "@/lib/scoring/signals";
import { checkPath, checkSlug, signalIdFromSlug } from "@/lib/utils/check-path";
import { percent } from "@/lib/utils/format";
import { hubPath } from "@/lib/utils/language";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { pageTitle } from "@/lib/utils/page-title";
import { APP_NAME, APP_URL, OG_DEFAULTS, OG_IMAGE_SIZE, TWITTER_DEFAULTS } from "@/lib/version";

type Params = { slug: string };

const PROSE = "m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim";
const LINK = "text-ink underline-offset-4 hover:text-ink-soft hover:underline";

export function generateStaticParams(): Params[] {
  return SIGNALS.map((s) => ({ slug: checkSlug(s.id) }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const id = signalIdFromSlug((await params).slug);
  if (!id) {
    return {};
  }

  const { title: heading, metaTitle, description } = CHECK_CONTENT[id];
  const title = metaTitle ?? heading;
  const path = checkPath(id);
  const image = { url: `/og${path}`, ...OG_IMAGE_SIZE, alt: SIGNAL_BY_ID[id].label };

  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: path },
    twitter: { ...TWITTER_DEFAULTS, images: [image], title, description },
    openGraph: { ...OG_DEFAULTS, images: [image], title, description, url: path, type: "article" },
  };
}

export default async function CheckPage({ params }: { params: Promise<Params> }) {
  const id = signalIdFromSlug((await params).slug);
  if (!id) {
    notFound();
  }

  const signal = SIGNAL_BY_ID[id];
  const content = CHECK_CONTENT[id];
  const questions = CHECK_QUESTIONS[id];
  const stats = getCheckStats(id);
  const languages = [...stats.languages].sort((a, b) => fullRate(b.counts) - fullRate(a.counts));
  const { contentChangedAt } = getLeaderboardStats();

  return (
    <>
      <BreadcrumbJsonLd
        parent={{ name: "Checks", path: "/check" }}
        current={{ name: signal.label, path: checkPath(id) }}
      />
      {/* dateModified is when the pass counts last moved; the prose has no tracked edit history, so no datePublished. */}
      <JsonLd
        data={{
          "@type": "TechArticle",
          headline: content.metaTitle ?? content.title,
          description: content.description,
          url: `${APP_URL}${checkPath(id)}`,
          image: `${APP_URL}/og${checkPath(id)}`,
          about: { "@type": "Thing", name: signal.label },
          ...(contentChangedAt != null ? { dateModified: new Date(contentChangedAt * 1000).toISOString() } : {}),
          author: { "@id": `${APP_URL}/about#author` },
          publisher: { "@type": "Organization", name: APP_NAME, url: APP_URL },
        }}
      />

      <Link
        href="/check"
        className="my-5 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink hover:no-underline"
      >
        ← all checks
      </Link>

      <section className="mb-7">
        <h1 className="mb-2.5 text-[28px] font-bold leading-[1.18] tracking-tight">{content.title}</h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] leading-relaxed text-ink-dim">
          <CodeText text={content.what} />
        </p>
      </section>

      <Panel>
        <PanelHeading>{questions.pass}</PanelHeading>
        <p className={PROSE}>
          Of the {stats.total} repos on the leaderboard,{" "}
          <strong className="text-ink">
            {stats.full} pass in full ({percent(stats.full, stats.total)})
          </strong>
          , {stats.partial} pass in part ({percent(stats.partial, stats.total)}) and {stats.none} fail (
          {percent(stats.none, stats.total)}).
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>{questions.why}</PanelHeading>
          <p className={PROSE}>
            <CodeText text={content.why} />
          </p>
        </Panel>
      </div>

      <div className="mt-3.5 grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        <Panel className="h-full">
          <PanelHeading>{questions.scoring}</PanelHeading>
          <ul className="m-0 ml-5 list-disc text-[14.5px] leading-relaxed text-ink-dim">
            {content.scoring.map((line) => (
              <li key={line}>
                <CodeText text={line} />
              </li>
            ))}
          </ul>
          <p className="mt-3 mb-0 text-[13px] text-muted">
            The{" "}
            <Link href="/methodology" className="text-ink-dim underline-offset-4 hover:text-ink-soft hover:underline">
              methodology
            </Link>{" "}
            has the formula that turns checks into a score.
          </p>
        </Panel>

        <Panel className="h-full">
          <PanelHeading>{questions.fix}</PanelHeading>
          <p className={PROSE}>
            <CodeText text={content.fix} />
          </p>
        </Panel>
      </div>

      <div className="mt-3.5 grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        <Panel className="h-full">
          <PanelHeading>{questions.agents}</PanelHeading>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[14.5px] text-ink-dim">
            {stats.agents.map(({ model, share }) => (
              <li key={model.id} className="flex items-baseline justify-between gap-3">
                <Link href={modelPath(model.id)} className={LINK}>
                  {model.label}
                </Link>
                <span className="tabular-nums">{percent(share, 1)} of its score</span>
              </li>
            ))}
          </ul>
        </Panel>

        {languages.length > 0 && (
          <Panel className="h-full">
            <PanelHeading>Pass rate by language</PanelHeading>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[14.5px] text-ink-dim">
              {languages.map((l) => (
                <li key={l.slug} className="flex items-baseline justify-between gap-3">
                  <Link href={hubPath(l.slug)} className={LINK}>
                    {l.label}
                  </Link>
                  <span className="tabular-nums">
                    {l.counts.full} of {l.counts.total} ({percent(l.counts.full, l.counts.total)})
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>

      {id === "agents_md" && (
        <p className="mt-3.5 mb-0 text-[14.5px] text-ink-dim">
          <Link href={`${checkPath(id)}/examples`} className={LINK}>
            AGENTS.md examples
          </Link>
          : every AGENTS.md and CLAUDE.md on the leaderboard, linked to the file on its host.
        </p>
      )}

      {stats.examples.length > 0 && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>Top-scoring repos that pass</PanelHeading>
            <CheckRepoList rows={stats.examples} />
          </Panel>
        </div>
      )}

      {stats.missing.length > 0 && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>Popular repos that fail it</PanelHeading>
            <CheckRepoList rows={stats.missing} />
          </Panel>
        </div>
      )}

      <nav
        aria-label="Other checks"
        className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-muted"
      >
        <span>Other checks:</span>
        {SIGNALS.filter((s) => s.id !== id).map((s) => (
          <Link key={s.id} href={checkPath(s.id)} className="text-ink-dim hover:text-ink-soft">
            {s.label}
          </Link>
        ))}
      </nav>
    </>
  );
}

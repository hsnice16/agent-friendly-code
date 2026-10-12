import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { CheckRepoList } from "@/components/CheckRepoList";
import { CodeText } from "@/components/CodeText";
import { Panel, PanelHeading } from "@/components/Panel";
import { CHECK_CONTENT } from "@/lib/check-content";
import { fullRate, getCheckStats } from "@/lib/check-stats";
import { SIGNAL_BY_ID, SIGNALS } from "@/lib/scoring/signals";
import { checkPath, checkSlug, signalIdFromSlug } from "@/lib/utils/check-path";
import { percent } from "@/lib/utils/format";
import { hubPath } from "@/lib/utils/language";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

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

  const { title, description } = CHECK_CONTENT[id];
  const path = checkPath(id);

  return {
    title,
    description,
    alternates: { canonical: path },
    twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description },
    openGraph: { ...OG_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description, url: path, type: "article" },
  };
}

export default async function CheckPage({ params }: { params: Promise<Params> }) {
  const id = signalIdFromSlug((await params).slug);
  if (!id) {
    notFound();
  }

  const signal = SIGNAL_BY_ID[id];
  const content = CHECK_CONTENT[id];
  const stats = getCheckStats(id);
  const languages = [...stats.languages].sort((a, b) => fullRate(b.counts) - fullRate(a.counts));

  return (
    <>
      <BreadcrumbJsonLd
        parent={{ name: "Checks", path: "/check" }}
        current={{ name: signal.label, path: checkPath(id) }}
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
        <PanelHeading>How many repos pass</PanelHeading>
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
          <PanelHeading>Why agents need it</PanelHeading>
          <p className={PROSE}>
            <CodeText text={content.why} />
          </p>
        </Panel>
      </div>

      <div className="mt-3.5 grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        <Panel className="h-full">
          <PanelHeading>How we score it</PanelHeading>
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
          <PanelHeading>How to pass</PanelHeading>
          <p className={PROSE}>
            <CodeText text={content.fix} />
          </p>
        </Panel>
      </div>

      <div className="mt-3.5 grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        <Panel className="h-full">
          <PanelHeading>Which agents count it most</PanelHeading>
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

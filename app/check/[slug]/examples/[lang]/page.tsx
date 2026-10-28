import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AgentsMdExampleTable } from "@/components/AgentsMdExampleTable";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { Panel, PanelHeading } from "@/components/Panel";
import {
  examplesByLanguage,
  type LanguageExamples,
  languageExamplesDescription,
  languageExamplesTitle,
} from "@/lib/agents-md-examples";
import { getLeaderboardStats } from "@/lib/db";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { SIGNAL_BY_ID } from "@/lib/scoring/signals";
import { checkPath, checkSlug, checkSubPath, languageExamplesPath } from "@/lib/utils/check-path";
import { hubPath } from "@/lib/utils/language";
import { pageTitle } from "@/lib/utils/page-title";
import { repoPath } from "@/lib/utils/repo-path";
import { APP_URL, DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const SIGNAL_ID = "agents_md";
const LINK = "text-ink hover:text-ink-soft";

type Params = Promise<{ slug: string; lang: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return examplesByLanguage(getAgentsMdExamples()).map((l) => ({ slug: checkSlug(SIGNAL_ID), lang: l.slug }));
}

async function languageOf(params: Params): Promise<LanguageExamples | null> {
  const { slug, lang } = await params;
  if (slug !== checkSlug(SIGNAL_ID)) return null;
  return examplesByLanguage(getAgentsMdExamples()).find((l) => l.slug === lang) ?? null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const lang = await languageOf(params);
  if (!lang) return {};
  const path = languageExamplesPath(lang.slug);
  const title = languageExamplesTitle(lang);
  const description = languageExamplesDescription(lang);

  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: path },
    twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description },
    openGraph: { ...OG_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description, url: path, type: "website" },
  };
}

function jsonLd(lang: LanguageExamples, contentChangedAt: number | null) {
  const url = `${APP_URL}${languageExamplesPath(lang.slug)}`;
  return {
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        url,
        name: languageExamplesTitle(lang),
        description: languageExamplesDescription(lang),
        about: [
          { "@type": "Thing", name: "AGENTS.md" },
          { "@type": "ComputerLanguage", name: lang.label },
        ],
        isPartOf: { "@id": `${APP_URL}/#site` },
        ...(contentChangedAt != null ? { dateModified: new Date(contentChangedAt * 1000).toISOString() } : {}),
        mainEntity: {
          "@type": "ItemList",
          name: `${lang.label} repos with an AGENTS.md or CLAUDE.md`,
          numberOfItems: lang.rows.length,
          itemListElement: lang.rows.map((r, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${r.owner}/${r.name}`,
            url: `${APP_URL}${repoPath(r)}`,
          })),
        },
      },
    ],
  };
}

export default async function LanguageExamplesPage({ params }: { params: Params }) {
  const lang = await languageOf(params);
  if (!lang) notFound();

  const examplesPath = checkSubPath(SIGNAL_ID, "examples");
  const others = examplesByLanguage(getAgentsMdExamples()).filter((l) => l.slug !== lang.slug);

  return (
    <>
      <JsonLd data={jsonLd(lang, getLeaderboardStats().contentChangedAt)} />
      <Breadcrumbs
        parents={[
          { name: "Checks", path: "/check" },
          { name: SIGNAL_BY_ID[SIGNAL_ID].label, path: checkPath(SIGNAL_ID) },
          { name: "Examples", path: examplesPath },
        ]}
        current={{ name: lang.label, path: languageExamplesPath(lang.slug) }}
      />

      <section className="mb-7">
        <h1 className="mb-2.5 text-[28px] font-bold leading-[1.18] tracking-tight">
          {lang.label} AGENTS.md examples from {lang.rows.length} open source repos
        </h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] leading-relaxed text-ink-dim">
          {lang.rows.length} of the {lang.total} {lang.label} repos on the leaderboard have an AGENTS.md or CLAUDE.md at
          the root, and {lang.passing} are long enough to pass the{" "}
          <Link href={checkPath(SIGNAL_ID)} className={LINK}>
            AGENTS.md check
          </Link>{" "}
          in full. Most-starred first; each file name links to the file.
        </p>
      </section>

      <Panel>
        <PanelHeading>
          {lang.label} repos with an AGENTS.md or CLAUDE.md ({lang.rows.length})
        </PanelHeading>
        <AgentsMdExampleTable
          showLanguage={false}
          rows={lang.rows}
          caption={`${lang.label} repos on the leaderboard with an AGENTS.md or CLAUDE.md`}
        />
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>More examples</PanelHeading>
          <ul className="m-0 mb-3 flex list-none flex-col gap-1.5 p-0 text-[14.5px] text-ink-dim">
            <li>
              <Link href={examplesPath} className={LINK}>
                Every language
              </Link>
              : all {getAgentsMdExamples().rows.length} files, with the longest and shortest that pass
            </li>
            <li>
              <Link href={hubPath(lang.slug)} className={LINK}>
                Most agent-friendly {lang.label} repos
              </Link>
              : all {lang.total}, ranked on every check
            </li>
            <li>
              <Link href={checkSubPath(SIGNAL_ID, "vs-claude-md")} className={LINK}>
                AGENTS.md vs CLAUDE.md
              </Link>
              : which file to write
            </li>
          </ul>
          {others.length > 0 && (
            <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0 text-[14px] text-ink-dim">
              {others.map((l) => (
                <li key={l.slug}>
                  <Link href={languageExamplesPath(l.slug)} className={LINK}>
                    {l.label}
                  </Link>{" "}
                  <span className="tabular-nums text-muted">({l.rows.length})</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}

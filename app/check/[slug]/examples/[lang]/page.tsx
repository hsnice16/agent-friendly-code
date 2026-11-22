import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AgentsMdExampleTable } from "@/components/AgentsMdExampleTable";
import { AgentsMdFrameworkGuide, AgentsMdGuidePanels } from "@/components/AgentsMdFrameworkGuide";
import { BestAgentsMdExample } from "@/components/BestAgentsMdExample";
import { CodeText } from "@/components/CodeText";
import { GeneratorCallout } from "@/components/GeneratorCallout";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { LINK } from "@/components/link-class";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { frameworkLinksForLanguage, languageLinksForFramework } from "@/lib/agents-md-example-links";
import {
  examplesByLanguage,
  type LanguageExamples,
  languageExamplesDescription,
  languageExamplesTitle,
} from "@/lib/agents-md-examples";
import { censusLookup, pickBestExample } from "@/lib/agents-md-examples-best";
import {
  examplesByFramework,
  type FrameworkExamples,
  frameworkExamplesDescription,
  frameworkExamplesTitle,
} from "@/lib/agents-md-frameworks";
import { CENSUS } from "@/lib/file-census";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { frameworkModified, rowsModified } from "@/lib/page-dates";
import {
  CHECKS_CRUMB,
  checkCrumb,
  checkPath,
  checkSlug,
  checkSubPath,
  frameworkExamplesPath,
  languageExamplesPath,
} from "@/lib/utils/check-path";
import { hubPath } from "@/lib/utils/language";
import { ogImage } from "@/lib/utils/og-image";
import { pageTitle } from "@/lib/utils/page-title";
import { OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

import { frameworkJsonLd, languageJsonLd } from "./json-ld";

const SIGNAL_ID = "agents_md";

type Params = Promise<{ slug: string; lang: string }>;

export const dynamicParams = false;

// `lang` is a language or a framework slug: both are "AGENTS.md examples for X".
export function generateStaticParams() {
  const ex = getAgentsMdExamples();
  return [...examplesByLanguage(ex), ...examplesByFramework(ex).map((f) => f.guide)].map((l) => ({
    slug: checkSlug(SIGNAL_ID),
    lang: l.slug,
  }));
}

async function languageOf(params: Params): Promise<LanguageExamples | null> {
  const { slug, lang } = await params;
  if (slug !== checkSlug(SIGNAL_ID)) return null;
  return examplesByLanguage(getAgentsMdExamples()).find((l) => l.slug === lang) ?? null;
}

async function frameworkOf(params: Params): Promise<FrameworkExamples | null> {
  const { slug, lang } = await params;
  if (slug !== checkSlug(SIGNAL_ID)) return null;
  return examplesByFramework(getAgentsMdExamples()).find((f) => f.guide.slug === lang) ?? null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const framework = await frameworkOf(params);
  const lang = framework ? null : await languageOf(params);
  const meta = framework
    ? {
        path: frameworkExamplesPath(framework.guide.slug),
        title: frameworkExamplesTitle(framework),
        description: frameworkExamplesDescription(framework),
      }
    : lang
      ? {
          path: languageExamplesPath(lang.slug),
          title: languageExamplesTitle(lang),
          description: languageExamplesDescription(lang),
        }
      : null;
  if (!meta) return {};
  const { path, title, description } = meta;

  const image = ogImage(path, title);
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: path },
    twitter: { ...TWITTER_DEFAULTS, images: [image], title, description },
    openGraph: { ...OG_DEFAULTS, images: [image], title, description, url: path, type: "website" },
  };
}

export default async function LanguageExamplesPage({ params }: { params: Params }) {
  const examplesPath = checkSubPath(SIGNAL_ID, "examples");
  const trail = [CHECKS_CRUMB, checkCrumb(SIGNAL_ID)];
  const framework = await frameworkOf(params);
  if (framework) {
    return (
      <>
        <JsonLd data={frameworkJsonLd(framework)} />
        <PageHeader
          crumbs={{
            parents: [...trail, { name: "Examples", path: examplesPath }],
            current: { name: framework.guide.label, path: frameworkExamplesPath(framework.guide.slug) },
          }}
          title={`What to put in an AGENTS.md for ${framework.guide.label}`}
          lead={<CodeText text={framework.guide.intro} />}
          updated={frameworkModified(framework)}
        />
        <AgentsMdFrameworkGuide
          framework={framework}
          others={examplesByFramework(getAgentsMdExamples())
            .filter((f) => f.guide.slug !== framework.guide.slug)
            .map((f) => f.guide)}
          languages={languageLinksForFramework(getAgentsMdExamples(), framework.guide)}
        />
      </>
    );
  }

  const lang = await languageOf(params);
  if (!lang) notFound();

  const others = examplesByLanguage(getAgentsMdExamples()).filter((l) => l.slug !== lang.slug);
  const frameworks = frameworkLinksForLanguage(getAgentsMdExamples(), lang.slug);
  const best = pickBestExample(lang.rows, censusLookup(CENSUS.repos));

  return (
    <>
      <JsonLd data={languageJsonLd(lang)} />
      <PageHeader
        crumbs={{
          parents: [...trail, { name: "Examples", path: examplesPath }],
          current: { name: lang.label, path: languageExamplesPath(lang.slug) },
        }}
        updated={rowsModified(lang.rows)}
        title={
          lang.guide
            ? `What to put in an AGENTS.md for a ${lang.label} repo`
            : `${lang.label} AGENTS.md examples from ${lang.rows.length} open source repos`
        }
        lead={lang.guide ? <CodeText text={lang.guide.intro} /> : <ExamplesSummary lang={lang} />}
      />

      {best && <BestAgentsMdExample best={best} language={lang.label} />}

      {lang.guide && (
        <div className={best ? "mt-3.5" : undefined}>
          <AgentsMdGuidePanels guide={lang.guide} />
        </div>
      )}

      <div className={best || lang.guide ? "mt-3.5" : undefined}>
        <Panel>
          <PanelHeading>
            {lang.label} repos with an AGENTS.md or CLAUDE.md ({lang.rows.length})
          </PanelHeading>
          {lang.guide && (
            <p className="m-0 mb-3 text-[14px] text-ink-dim">
              <ExamplesSummary lang={lang} />
            </p>
          )}
          <AgentsMdExampleTable
            showLanguage={false}
            rows={lang.rows}
            caption={`${lang.label} repos on the leaderboard with an AGENTS.md or CLAUDE.md`}
          />
        </Panel>
      </div>

      <div className="mt-3.5">
        <GeneratorCallout page="language" />
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>More examples</PanelHeading>
          <ul className="m-0 mb-3 flex list-none flex-col p-0 text-[14.5px] text-ink-dim">
            <li className="link-row">
              <IntentLink href={examplesPath} className={`${LINK} cover-link`}>
                Every language
              </IntentLink>
              : {getAgentsMdExamples().rows.length} files by language and framework, the longest and shortest that pass,
              and a CSV of all of them
            </li>
            <li className="link-row">
              <IntentLink href={hubPath(lang.slug)} className={`${LINK} cover-link`}>
                Most agent-friendly {lang.label} repos
              </IntentLink>
              : all {lang.total}, ranked on every check
            </li>
            <li className="link-row">
              <IntentLink href={checkSubPath(SIGNAL_ID, "vs-claude-md")} className={`${LINK} cover-link`}>
                AGENTS.md vs CLAUDE.md
              </IntentLink>
              : which file to write
            </li>
            {frameworks.length > 0 && (
              <li className="py-2">
                {frameworks.map((f, i) => (
                  <span key={f.href}>
                    {i > 0 && " · "}
                    <IntentLink href={f.href} className={LINK}>
                      {f.label}
                    </IntentLink>
                  </span>
                ))}
                : {lang.label} frameworks, with what to put in the file
              </li>
            )}
          </ul>
          {others.length > 0 && (
            <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0 text-[14px] text-ink-dim">
              {others.map((l) => (
                <li key={l.slug}>
                  <IntentLink href={languageExamplesPath(l.slug)} className={LINK}>
                    {l.label}
                  </IntentLink>{" "}
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

function ExamplesSummary({ lang }: { lang: LanguageExamples }) {
  return (
    <>
      {lang.rows.length} of {lang.total} {lang.label} leaderboard repos have an AGENTS.md or CLAUDE.md at the root, and{" "}
      {lang.passing} are long enough to pass the{" "}
      <IntentLink href={checkPath(SIGNAL_ID)} className="prose-link">
        AGENTS.md check
      </IntentLink>{" "}
      in full. Most-starred first; each file name links to the file.
    </>
  );
}

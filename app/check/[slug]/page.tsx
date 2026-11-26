import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AgentsMdGuide } from "@/components/AgentsMdGuide";
import { AgentsMdPractices } from "@/components/AgentsMdPractices";
import { CheckPracticePanel } from "@/components/CheckPracticePanel";
import { CheckRepoList } from "@/components/CheckRepoList";
import { CodeText } from "@/components/CodeText";
import { GeneratorCallout } from "@/components/GeneratorCallout";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { LinkedText } from "@/components/LinkedText";
import { LINK } from "@/components/link-class";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { PROSE } from "@/components/prose-class";
import { SkillsCensusPanel } from "@/components/SkillsCensusPanel";
import { getAgentSkillsReport } from "@/lib/agent-skills-data";
import { frameworkExampleLinks, languageExampleLinks } from "@/lib/agents-md-example-links";
import { AUTHOR_JSON_LD } from "@/lib/author";
import { hookFrameworkCounts } from "@/lib/check-breakdowns";
import { CHECK_CONTENT, CHECK_QUESTIONS } from "@/lib/check-content";
import { CHECK_PRACTICE } from "@/lib/check-content/practice";
import { VS_AGENTS_MD } from "@/lib/check-content/vs-agents-md";
import { fullRate, getCheckStats } from "@/lib/check-stats";
import { listSignalFiles } from "@/lib/db";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { licensePolicyNote } from "@/lib/license-policy";
import { checkModified } from "@/lib/page-dates";
import { SIGNAL_BY_ID, SIGNALS } from "@/lib/scoring/signals";
import { PUBLISHER_JSON_LD } from "@/lib/site-json-ld";
import { CHECKS_CRUMB, checkCrumb, checkPath, checkSlug, checkSubPath, signalIdFromSlug } from "@/lib/utils/check-path";
import { CONTRIBUTE_PATH } from "@/lib/utils/contribute-path";
import { percent } from "@/lib/utils/format";
import { hubPath } from "@/lib/utils/language";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { ogImage } from "@/lib/utils/og-image";
import { pageTitle } from "@/lib/utils/page-title";
import { SKILLS_REPORT_PATH } from "@/lib/utils/report-path";
import { APP_URL, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

type Params = { slug: string };

const SKILLS_SHOWN = 10;

export const dynamicParams = false;

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
  const image = ogImage(path, SIGNAL_BY_ID[id].label);

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
  const practice = Object.hasOwn(CHECK_PRACTICE, id) ? CHECK_PRACTICE[id] : null;
  const languages = [...stats.languages].sort((a, b) => fullRate(b.counts) - fullRate(a.counts));
  const modified = checkModified(id);
  const hooks = id === "pre_commit" ? hookFrameworkCounts(listSignalFiles(id)) : null;
  const licenseNote = id === "license" ? licensePolicyNote() : null;
  const skills = id === "agent_skills" ? getAgentSkillsReport() : null;
  const examples = id === "agents_md" ? getAgentsMdExamples() : null;

  return (
    <>
      <JsonLd
        data={{
          "@type": "TechArticle",
          headline: content.metaTitle ?? content.title,
          description: content.description,
          url: `${APP_URL}${checkPath(id)}`,
          image: `${APP_URL}${ogImage(checkPath(id), signal.label).url}`,
          about: { "@type": "Thing", name: signal.label },
          datePublished: content.published,
          dateModified: modified,
          author: AUTHOR_JSON_LD,
          publisher: PUBLISHER_JSON_LD,
        }}
      />

      <PageHeader
        crumbs={{ parents: [CHECKS_CRUMB], current: checkCrumb(id) }}
        title={content.title}
        lead={<CodeText text={content.what} />}
        updated={modified}
      />

      <Panel>
        <PanelHeading>{questions.pass}</PanelHeading>
        <p className={PROSE}>
          Of the {stats.total} repos on the leaderboard,{" "}
          <strong className="text-ink">
            {stats.full} pass in full ({percent(stats.full, stats.total)})
          </strong>
          , {stats.partial} pass in part ({percent(stats.partial, stats.total)}) and {stats.none} fail (
          {percent(stats.none, stats.total)}).
          {hooks && <> By framework: {hooks.map((h) => `${h.framework} ${h.count}`).join(", ")}.</>}
          {licenseNote && <LinkedText text={` ${licenseNote}`} />}
        </p>
      </Panel>

      {skills && (
        <div className="mt-3.5">
          <SkillsCensusPanel report={skills} limit={SKILLS_SHOWN} />
        </div>
      )}

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>{questions.why}</PanelHeading>
          <p className={PROSE}>
            <CodeText text={content.why} />
          </p>
        </Panel>
      </div>

      {practice && (
        <div className="mt-3.5">
          <CheckPracticePanel practice={practice} stats={stats} />
        </div>
      )}

      {examples && (
        <div className="mt-3.5">
          <AgentsMdGuide
            medianLength={examples.medianLength}
            files={examples.rows.length}
            byLanguage={languageExampleLinks(examples)}
            byFramework={frameworkExampleLinks(examples)}
          />
        </div>
      )}

      {examples && (
        <div className="mt-3.5">
          <GeneratorCallout page="check" />
        </div>
      )}

      {examples && (
        <div className="mt-3.5">
          <AgentsMdPractices />
        </div>
      )}

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
            How checks become a score:{" "}
            <IntentLink href="/methodology" className="prose-link">
              methodology
            </IntentLink>
            .
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
          <ul className="link-list">
            {stats.agents.map(({ model, share }) => (
              <li key={model.id} className="flex items-baseline justify-between gap-3 link-row">
                <IntentLink href={modelPath(model.id)} className={`${LINK} cover-link`}>
                  {model.label}
                </IntentLink>
                <span className="tabular-nums">{percent(share, 1)} of its score</span>
              </li>
            ))}
          </ul>
        </Panel>

        {languages.length > 0 && (
          <Panel className="h-full">
            <PanelHeading>Pass rate by language</PanelHeading>
            <ul className="link-list">
              {languages.map((l) => (
                <li key={l.slug} className="flex items-baseline justify-between gap-3 link-row">
                  <IntentLink href={hubPath(l.slug)} className={`${LINK} cover-link`}>
                    {l.label}
                  </IntentLink>
                  <span className="tabular-nums">
                    {l.counts.full} of {l.counts.total} ({percent(l.counts.full, l.counts.total)})
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>

      {Object.hasOwn(VS_AGENTS_MD, id) && (
        <p className="mt-3.5 mb-0 text-[14.5px] text-ink-dim">
          <IntentLink href={checkSubPath(id, "vs-agents-md")} className={LINK}>
            {VS_AGENTS_MD[id].name} vs AGENTS.md
          </IntentLink>
          : which to use, and how to keep one source.
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

      <p className="mt-6 mb-0 text-[13px] text-muted">
        Every check, grouped into what to do first:{" "}
        <IntentLink href="/guide" className="prose-link">
          how to make your repo ready for AI coding agents
        </IntentLink>
        .
        {id === "contributing" && (
          <>
            {" "}
            <IntentLink href={CONTRIBUTE_PATH} className="prose-link">
              Projects ready for agent-assisted contributions
            </IntentLink>
            .
          </>
        )}
        {id === "agent_skills" && (
          <>
            {" "}
            <IntentLink href={SKILLS_REPORT_PATH} className="prose-link">
              Which popular repos ship skills
            </IntentLink>
            .
          </>
        )}
      </p>

      <nav
        aria-label="Other checks"
        className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-muted"
      >
        <span>Other checks:</span>
        {SIGNALS.filter((s) => s.id !== id).map((s) => (
          <IntentLink key={s.id} href={checkPath(s.id)} className="dim-link">
            {s.label}
          </IntentLink>
        ))}
      </nav>
    </>
  );
}

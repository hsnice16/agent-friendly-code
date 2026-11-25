import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AgentsMdExampleTable } from "@/components/AgentsMdExampleTable";
import { CheckRepoList } from "@/components/CheckRepoList";
import { CodeText } from "@/components/CodeText";
import { GeneratorCallout } from "@/components/GeneratorCallout";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { LINK } from "@/components/link-class";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import {
  type AgentsMdExamples,
  examplesDescription,
  examplesTitle,
  examplesWithoutLanguagePage,
  LANGUAGE_EXAMPLES_MIN,
} from "@/lib/agents-md-examples";
import { examplesByFramework } from "@/lib/agents-md-frameworks";
import { CHECK_CONTENT } from "@/lib/check-content";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { examplesModified } from "@/lib/page-dates";
import { MODELS } from "@/lib/scoring/weights";
import { WEBSITE_JSON_LD } from "@/lib/site-json-ld";
import {
  CHECKS_CRUMB,
  checkCrumb,
  checkPath,
  checkSlug,
  checkSubPath,
  frameworkExamplesPath,
  languageExamplesPath,
} from "@/lib/utils/check-path";
import { percent } from "@/lib/utils/format";
import { hubPath } from "@/lib/utils/language";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { ogImage } from "@/lib/utils/og-image";
import { pageTitle } from "@/lib/utils/page-title";
import { repoPath } from "@/lib/utils/repo-path";
import { REPORT_PATH, REPORT_TITLE, SIZE_REPORT_PATH } from "@/lib/utils/report-path";
import { APP_URL, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const SIGNAL_ID = "agents_md";
const PATH = checkSubPath(SIGNAL_ID, "examples");
const CSV_PATH = `${PATH}.csv`;
const TOP_STARRED = 20;

const PROSE = "m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim";

// Only AGENTS.md is common enough to fill an examples page; every other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: checkSlug(SIGNAL_ID) }];
}

export function generateMetadata(): Metadata {
  const ex = getAgentsMdExamples();
  const title = examplesTitle(ex.rows.length);
  const description = examplesDescription(ex);

  const image = ogImage(PATH, title);
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: PATH },
    twitter: { ...TWITTER_DEFAULTS, images: [image], title, description },
    openGraph: { ...OG_DEFAULTS, images: [image], title, description, url: PATH, type: "website" },
  };
}

function jsonLd(ex: AgentsMdExamples, modified: string) {
  return {
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${APP_URL}${PATH}#page`,
        url: `${APP_URL}${PATH}`,
        name: examplesTitle(ex.rows.length),
        description: examplesDescription(ex),
        about: { "@type": "Thing", name: "AGENTS.md" },
        isPartOf: WEBSITE_JSON_LD,
        associatedMedia: { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${APP_URL}${CSV_PATH}` },
        dateModified: modified,
        // The most-starred only: all of them would be the page's heaviest part, twice (HTML and RSC payload).
        mainEntity: {
          "@type": "ItemList",
          name: "Most-starred open source repos with an AGENTS.md or CLAUDE.md",
          numberOfItems: Math.min(TOP_STARRED, ex.rows.length),
          itemListElement: ex.rows.slice(0, TOP_STARRED).map((r, i) => ({
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

export default async function AgentsMdExamplesPage({ params }: { params: Promise<{ slug: string }> }) {
  if ((await params).slug !== checkSlug(SIGNAL_ID)) {
    notFound();
  }

  const ex = getAgentsMdExamples();
  const frameworks = examplesByFramework(ex);
  const rest = examplesWithoutLanguagePage(ex);
  const modified = examplesModified();
  const readers = MODELS.map((m) => ({ m, weight: m.weights[SIGNAL_ID] ?? 0 }))
    .filter((r) => r.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  return (
    <>
      <JsonLd data={jsonLd(ex, modified)} />
      <PageHeader
        crumbs={{ parents: [CHECKS_CRUMB, checkCrumb(SIGNAL_ID)], current: { name: "Examples", path: PATH } }}
        updated={modified}
        title={`AGENTS.md examples from ${ex.rows.length} open source repos`}
        lead={
          <>
            {ex.rows.length} of {ex.boardSize} leaderboard repos have an AGENTS.md or CLAUDE.md at the root, and{" "}
            {ex.passing} are long enough (800+ characters) to pass the{" "}
            <IntentLink href={checkPath(SIGNAL_ID)} className="prose-link">
              AGENTS.md check
            </IntentLink>{" "}
            in full. Each file name links to the file. How that share has grown:{" "}
            <IntentLink href={REPORT_PATH} className="prose-link">
              {REPORT_TITLE}
            </IntentLink>
            . How long they run:{" "}
            <IntentLink href={SIZE_REPORT_PATH} className="prose-link">
              AGENTS.md sizes
            </IntentLink>
            .
          </>
        }
      />

      {ex.languages.length > 0 && (
        <div className="mb-3.5">
          <Panel>
            <PanelHeading>Examples by language</PanelHeading>
            <ul className="m-0 grid list-none grid-cols-1 gap-x-6 p-0 text-[14px] text-ink-dim sm:grid-cols-2 md:grid-cols-3">
              {ex.languages.map((l) => (
                <li key={l.slug} className="flex items-baseline justify-between gap-3 link-row">
                  <IntentLink
                    href={l.withFile >= LANGUAGE_EXAMPLES_MIN ? languageExamplesPath(l.slug) : hubPath(l.slug)}
                    className={`${LINK} cover-link`}
                  >
                    {l.label}
                  </IntentLink>
                  <span className="tabular-nums">
                    {l.withFile} of {l.total} ({percent(l.withFile, l.total)})
                  </span>
                </li>
              ))}
            </ul>
            {frameworks.length > 0 && (
              <p className="mt-3 mb-0 text-[14px] text-ink-dim">
                By framework, with what to put in the file:{" "}
                {frameworks.map((f, i) => (
                  <span key={f.guide.slug}>
                    {i > 0 && " · "}
                    <IntentLink href={frameworkExamplesPath(f.guide.slug)} className={LINK}>
                      {f.guide.label}
                    </IntentLink>
                  </span>
                ))}
              </p>
            )}
          </Panel>
        </div>
      )}

      <Panel>
        <PanelHeading>Most-starred repos with an AGENTS.md or CLAUDE.md</PanelHeading>
        <AgentsMdExampleTable
          rows={ex.rows.slice(0, TOP_STARRED)}
          caption="Most-starred repos with an AGENTS.md or CLAUDE.md"
        />
      </Panel>

      <div className="mt-3.5">
        <GeneratorCallout page="examples" />
      </div>

      {ex.longest.length > 0 && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>Longest and shortest files that pass</PanelHeading>
            <h3 className="m-0 mb-2 text-[14px] font-semibold text-ink">Longest</h3>
            <AgentsMdExampleTable rows={ex.longest} caption="Longest AGENTS.md or CLAUDE.md files that pass" />
            {ex.shortest.length > 0 && (
              <>
                <h3 className="mt-4 mb-2 text-[14px] font-semibold text-ink">Shortest</h3>
                <AgentsMdExampleTable rows={ex.shortest} caption="Shortest AGENTS.md or CLAUDE.md files that pass" />
              </>
            )}
          </Panel>
        </div>
      )}

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>AGENTS.md or CLAUDE.md: which file repos use</PanelHeading>
          <ul className="m-0 mb-3 flex list-none flex-col gap-1.5 p-0 text-[14.5px] text-ink-dim">
            {ex.byFile.map((f) => (
              <li key={f.file}>
                <code className="font-mono text-[13px] text-ink">{f.file}</code>: {f.count}{" "}
                {f.count === 1 ? "repo" : "repos"} ({f.passing} {f.passing === 1 ? "passes" : "pass"} in full)
              </li>
            ))}
          </ul>
          <p className={PROSE}>
            The check reads the first of AGENTS.md, CLAUDE.md and AGENT.md with content, so a repo with both counts
            under AGENTS.md unless its AGENTS.md is empty. Either name passes.{" "}
            <IntentLink href={checkSubPath(SIGNAL_ID, "vs-claude-md")} className="prose-link">
              Which one to use
            </IntentLink>
            .
          </p>
          <p className={`${PROSE} mt-3`}>
            <CodeText text={CHECK_CONTENT[SIGNAL_ID].why} />
          </p>
          <p className="mt-3 mb-1.5 text-[13px] text-muted">The weight each agent gives this check:</p>
          <ul className="m-0 grid list-none grid-cols-1 gap-x-6 p-0 text-[14px] text-ink-dim sm:grid-cols-3">
            {readers.map(({ m, weight }) => (
              <li key={m.id} className="flex items-baseline justify-between gap-3 link-row">
                <IntentLink href={modelPath(m.id)} className={`${LINK} cover-link`}>
                  {m.label}
                </IntentLink>
                <span className="tabular-nums">{weight.toFixed(1)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 mb-0 text-[13px] text-muted">
            The{" "}
            <IntentLink href="/methodology" className="prose-link">
              methodology
            </IntentLink>{" "}
            links the docs behind each weight.
          </p>
        </Panel>
      </div>

      {ex.missing.length > 0 && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>Popular repos without one</PanelHeading>
            <CheckRepoList rows={ex.missing} />
          </Panel>
        </div>
      )}

      <div className="mt-3.5">
        <Panel>
          {rest.length > 0 && (
            <>
              <PanelHeading>Languages without a page of their own ({rest.length})</PanelHeading>
              <AgentsMdExampleTable
                rows={rest}
                caption={`Repos with an AGENTS.md or CLAUDE.md in languages with fewer than ${LANGUAGE_EXAMPLES_MIN} files`}
              />
            </>
          )}
          <p className={`${rest.length > 0 ? "mt-3" : "mt-0"} mb-0 text-[13px] text-muted`}>
            Each language page above lists its own files. All {ex.rows.length}, with length, stars and score:{" "}
            <a href={CSV_PATH} className="prose-link">
              agents-md-examples.csv
            </a>
            .
          </p>
        </Panel>
      </div>
    </>
  );
}

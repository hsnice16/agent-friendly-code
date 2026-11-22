import type { Metadata } from "next";

import { ContributeTable } from "@/components/ContributeTable";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { AI_POLICY, aiPolicyByRepo, repoKey, STANCE_LABEL } from "@/lib/ai-policy";
import { CONTRIBUTE_LANGUAGE_TOP, LANGUAGE_AGENTS_MIN_REPOS } from "@/lib/constants/scoring";
import {
  buildContributeList,
  CONTRIBUTE_SIGNAL_IDS,
  CONTRIBUTE_TITLE,
  type ContributeList,
  type ContributeSignals,
  contributeDescription,
} from "@/lib/contribute";
import { getLeaderboardStats, listLeaderboardOverall, listSignalFiles } from "@/lib/db";
import { WEBSITE_JSON_LD } from "@/lib/site-json-ld";
import { checkPath } from "@/lib/utils/check-path";
import { CONTRIBUTE_PATH, contributeAnchor, contributeLanguageHref } from "@/lib/utils/contribute-path";
import { GUIDE_PATH } from "@/lib/utils/guide-path";
import { hubPath } from "@/lib/utils/language";
import { pageTitle } from "@/lib/utils/page-title";
import { repoPath } from "@/lib/utils/repo-path";
import { AI_POLICY_REPORT_PATH } from "@/lib/utils/report-path";
import { APP_URL, DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const PROSE = "m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim";
const CHIP = "chip tap-target border-line bg-surface-2 text-muted hover:border-line-strong hover:text-ink";

function getList(): ContributeList {
  const signals = Object.fromEntries(CONTRIBUTE_SIGNAL_IDS.map((id) => [id, listSignalFiles(id)])) as ContributeSignals;
  const board = listLeaderboardOverall();
  const found = aiPolicyByRepo();
  const policies = new Map(
    board.flatMap((r) => {
      const p = found.get(repoKey(r));
      return p ? [[r.id, { label: STANCE_LABEL[p.stance], url: p.url, refusesAi: p.stance === "bans" }] as const] : [];
    }),
  );
  return buildContributeList(board, signals, policies);
}

export function generateMetadata(): Metadata {
  const description = contributeDescription(getList());
  const title = CONTRIBUTE_TITLE;
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: CONTRIBUTE_PATH },
    twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description },
    openGraph: {
      ...OG_DEFAULTS,
      images: [DEFAULT_OG_IMAGE],
      title,
      description,
      url: CONTRIBUTE_PATH,
      type: "website",
    },
  };
}

function jsonLd(list: ContributeList, contentChangedAt: number | null): Record<string, unknown> {
  return {
    "@type": "CollectionPage",
    "@id": `${APP_URL}${CONTRIBUTE_PATH}#page`,
    url: `${APP_URL}${CONTRIBUTE_PATH}`,
    name: CONTRIBUTE_TITLE,
    description: contributeDescription(list),
    isPartOf: WEBSITE_JSON_LD,
    ...(contentChangedAt != null ? { dateModified: new Date(contentChangedAt * 1000).toISOString() } : {}),
    mainEntity: {
      "@type": "ItemList",
      name: "Open source projects ready for AI-assisted contributions",
      numberOfItems: list.top.length,
      itemListElement: list.top.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${r.owner}/${r.name}`,
        url: `${APP_URL}${repoPath(r)}`,
      })),
    },
  };
}

export default function ContributePage() {
  const list = getList();

  return (
    <>
      <JsonLd data={jsonLd(list, getLeaderboardStats().contentChangedAt)} />
      <PageHeader
        crumbs={{ current: { name: "Contribute", path: CONTRIBUTE_PATH } }}
        title={CONTRIBUTE_TITLE}
        lead={
          <>
            <strong className="text-ink">
              {list.withWorkflow} of the {list.boardSize} popular repos we track have a CONTRIBUTING guide, tests and CI
            </strong>
            : what an AI coding agent needs to follow a project&apos;s workflow and check its own change. Best set up
            for agents first.
          </>
        }
      />

      <Panel tone="warn">
        <PanelHeading tone="warn" icon="book-open">
          Read the project&apos;s rules first
        </PanelHeading>
        <p className={PROSE}>
          Before opening an AI-assisted pull request, read the CONTRIBUTING guide and any AI policy: some projects
          restrict or refuse AI-generated contributions, or ask you to say when an agent helped. A listed repo is easy
          for an agent to work in; that doesn&apos;t mean its maintainers want agent-written changes.
        </p>
        <p className={`${PROSE} mt-2`}>
          {list.refused > 0 && <>Left out: {list.refused} that would qualify but whose policy refuses them. </>}
          <IntentLink href={AI_POLICY_REPORT_PATH} className="prose-link">
            What {AI_POLICY.policies.length} projects&apos; AI policies say
          </IntentLink>
          .
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Top {list.top.length} projects</PanelHeading>
          <ContributeTable
            rows={list.top}
            caption={`Top ${list.top.length} projects to contribute to with AI agents`}
          />
        </Panel>
      </div>

      {list.languages.length > 0 && (
        <nav aria-label="Jump to a language" className="mt-6">
          <ul className="m-0 flex list-none flex-wrap gap-x-1.5 gap-y-[23px] p-0 sm:gap-y-1.5">
            {list.languages.map((l) => (
              <li key={l.slug}>
                <a href={contributeLanguageHref(l.slug)} className={CHIP}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {list.languages.map((l) => (
        <div key={l.slug} id={contributeAnchor(l.slug)} className="mt-3.5 scroll-mt-20">
          <Panel>
            <PanelHeading>Best {l.label} projects to contribute to</PanelHeading>
            <ContributeTable
              rows={l.rows}
              showLanguage={false}
              caption={`Top ${l.rows.length} ${l.label} projects to contribute to with AI agents`}
            />
            <p className={`${PROSE} mt-3 text-[13px]`}>
              Top {Math.min(CONTRIBUTE_LANGUAGE_TOP, l.rows.length)} of {l.eligible} {l.label} repos that qualify.{" "}
              <IntentLink href={hubPath(l.slug)} className="arrow-link">
                Every {l.label} repo →
              </IntentLink>
            </p>
          </Panel>
        </div>
      ))}

      <div className="mt-3.5 grid grid-cols-1 items-start gap-3.5 md:grid-cols-2">
        <Panel>
          <PanelHeading>How this list is made</PanelHeading>
          <ul className="m-0 ml-5 flex list-disc flex-col gap-1.5 text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              A repo qualifies with a{" "}
              <IntentLink href={checkPath("contributing")} className="prose-link">
                CONTRIBUTING guide
              </IntentLink>
              , a test suite and CI, as our checks find them in its tree.
            </li>
            <li>
              Ordered by overall agent-readiness score, then stars. The method is ours; it says nothing about how
              welcoming a community is or how fast it reviews.
            </li>
            <li>
              Agent file means the non-empty AGENTS.md or CLAUDE.md our check found, at the root or in .claude/. Dev
              setup means a Makefile, devcontainer, Docker file or similar. Pre-commit means a pre-commit, husky or
              lefthook config.
            </li>
            <li>
              Languages get a section once {LANGUAGE_AGENTS_MIN_REPOS} repos on the board use them. Our own repos are
              left out.
            </li>
          </ul>
        </Panel>
        <Panel tone="tip">
          <PanelHeading tone="tip" icon="robot">
            Contributing with an agent
          </PanelHeading>
          <ul className="m-0 ml-5 flex list-disc flex-col gap-1.5 text-[14.5px] leading-relaxed text-ink-dim">
            <li>Have the agent read CONTRIBUTING and the agent file before it touches code.</li>
            <li>Run the project&apos;s tests and linters yourself, and say in the PR that an agent helped.</li>
            <li>Start with an issue labelled for newcomers, and keep the change small.</li>
          </ul>
          <div className="mt-3 flex flex-col gap-1.5 text-[14.5px]">
            <IntentLink href="/score" className="arrow-link">
              Score a repo that isn&apos;t listed →
            </IntentLink>
            <IntentLink href={GUIDE_PATH} className="arrow-link">
              Make your own repo agent-friendly →
            </IntentLink>
          </div>
        </Panel>
      </div>
    </>
  );
}

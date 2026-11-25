import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CodeText } from "@/components/CodeText";
import { ExternalLink } from "@/components/ExternalLink";
import { FaqSection } from "@/components/FaqSection";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { LINK } from "@/components/link-class";
import { PAGE_LEAD, PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { type ReadsRow, ReadsTableView, type SetupCard, SetupsView } from "@/components/VsClaudeMdViews";
import { AGENT_READS, type AgentsMdUse, OTHER_TOOLS } from "@/lib/agent-reads";
import { AUTHOR_JSON_LD } from "@/lib/author";
import { setupExamples } from "@/lib/check-breakdowns";
import { VS_AGENTS_MD } from "@/lib/check-content/vs-agents-md";
import { CHECK_SNIPPET, SETUPS, VS_CLAUDE_MD_FAQ, VS_CLAUDE_MD_SOURCES } from "@/lib/check-content/vs-claude-md";
import { listLeaderboardOverall } from "@/lib/db";
import { CENSUS_SUMMARY as C } from "@/lib/file-census";
import { getInstructionFileCounts } from "@/lib/leaderboard-files";
import { distinctSourceLabels } from "@/lib/leaderboard-model-panel";
import { vsClaudeMdModified } from "@/lib/page-dates";
import { AGENTS_VS_CLAUDE_MD } from "@/lib/page-meta";
import { MODELS } from "@/lib/scoring/weights";
import { PUBLISHER_JSON_LD } from "@/lib/site-json-ld";
import { CHECKS_CRUMB, checkCrumb, checkPath, checkSlug, checkSubPath } from "@/lib/utils/check-path";
import { formatDay, percent } from "@/lib/utils/format";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { pageTitle } from "@/lib/utils/page-title";
import { repoPath } from "@/lib/utils/repo-path";
import { APP_URL, DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const SIGNAL_ID = "agents_md";
const PATH = checkSubPath(SIGNAL_ID, "vs-claude-md");
const EXAMPLES_PER_SETUP = 3;

const { title: TITLE, description: DESCRIPTION } = AGENTS_VS_CLAUDE_MD;

const PROSE = "m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim";

const AGENTS_MD_CELL: Record<AgentsMdUse, string> = {
  always: "Yes",
  fallback: "When there is no CLAUDE.md",
  setting: "When configured to",
  no: "No",
};

// Claude Code's own table: what it loads for each combination of files.
const BOTH_FILES = [
  { has: "AGENTS.md only", reads: "AGENTS.md" },
  { has: "AGENTS.md and CLAUDE.md", reads: "CLAUDE.md only" },
  { has: "AGENTS.md, and a CLAUDE.md that imports it with @AGENTS.md", reads: "Both" },
];

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: checkSlug(SIGNAL_ID) }];
}

export const metadata: Metadata = {
  title: pageTitle(TITLE),
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title: TITLE, description: DESCRIPTION },
  openGraph: {
    ...OG_DEFAULTS,
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    type: "article",
  },
};

export default async function AgentsMdVsClaudeMdPage({ params }: { params: Promise<{ slug: string }> }) {
  if ((await params).slug !== checkSlug(SIGNAL_ID)) {
    notFound();
  }

  const modified = vsClaudeMdModified();
  const counts = getInstructionFileCounts();
  const countOf = (file: string) => counts.files.find((f) => f.file === file)?.count ?? 0;
  const agentsMd = countOf("AGENTS.md");
  const claudeOnly = countOf("CLAUDE.md");
  const examples = setupExamples(listLeaderboardOverall(), EXAMPLES_PER_SETUP);
  const setupCount = { import: C.claudeImportsAgents, symlink: C.rootBothLinked, separate: C.twoUnlinkedFiles };
  const rows: ReadsRow[] = [
    ...MODELS.map((m) => ({
      key: m.id,
      label: m.label,
      href: modelPath(m.id),
      agentsMd: AGENTS_MD_CELL[AGENT_READS[m.id].agentsMd],
      claudeMd: AGENT_READS[m.id].claudeMd,
    })),
    ...OTHER_TOOLS.map((t) => ({
      key: t.name,
      label: t.name,
      agentsMd: t.agentsMd,
      claudeMd: t.files.includes("CLAUDE.md"),
    })),
  ];
  const setups: SetupCard[] = SETUPS.map((st) => ({
    ...st,
    count: setupCount[st.id],
    examples: examples[st.id].map((full) => {
      const [owner, name] = full.split("/");
      return { label: full, href: repoPath({ host: "github", owner, name }) };
    }),
  }));

  return (
    <>
      <JsonLd
        data={{
          "@type": "TechArticle",
          headline: TITLE,
          description: DESCRIPTION,
          url: `${APP_URL}${PATH}`,
          image: `${APP_URL}${DEFAULT_OG_IMAGE.url}`,
          about: [
            { "@type": "Thing", name: "AGENTS.md" },
            { "@type": "Thing", name: "CLAUDE.md" },
          ],
          citation: VS_CLAUDE_MD_SOURCES,
          datePublished: "2026-10-21",
          dateModified: modified,
          author: AUTHOR_JSON_LD,
          publisher: PUBLISHER_JSON_LD,
        }}
      />
      <PageHeader
        crumbs={{
          parents: [CHECKS_CRUMB, checkCrumb(SIGNAL_ID)],
          current: { name: "AGENTS.md vs CLAUDE.md", path: PATH },
        }}
        title={TITLE}
        lead={
          <CodeText
            text={`Use AGENTS.md, and if anyone uses Claude Code, add a CLAUDE.md that imports it with \`@AGENTS.md\`: Claude Code reads AGENTS.md only when there is no CLAUDE.md. ${agentsMd} of ${counts.total} popular repos (${percent(agentsMd, counts.total)}) have an AGENTS.md; ${claudeOnly} have only a CLAUDE.md.`}
          />
        }
        updated={modified}
      >
        <p className={`mt-2.5 ${PAGE_LEAD}`}>
          Both are plain Markdown with the same content. AGENTS.md is the open format most agents read; CLAUDE.md is
          Claude Code&apos;s name for it.
        </p>
      </PageHeader>

      <Panel>
        <PanelHeading>Which agents read AGENTS.md and which read CLAUDE.md?</PanelHeading>
        <ReadsTableView rows={rows} />
        <p className={`${PROSE} mt-3 text-[13px]`}>
          <IntentLink href="/agents" className={LINK}>
            Every file each agent reads
          </IntentLink>
          , with links to their docs.
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>What does Claude Code do when a repo has both?</PanelHeading>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[14.5px] text-ink-dim">
            {BOTH_FILES.map((r) => (
              <li key={r.has} className="flex items-baseline justify-between gap-3">
                <span>{r.has}</span>
                <span className="shrink-0 text-ink">{r.reads}</span>
              </li>
            ))}
          </ul>
          <p className={`${PROSE} mt-3 text-[13px]`}>
            <CodeText text="Needs Claude Code v2.1.277 or later. A `.claude/CLAUDE.md` or CLAUDE.local.md counts as a CLAUDE.md. Run `/memory` to see what loaded." />
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>How do I keep one file for both?</PanelHeading>
          <SetupsView setups={setups} check={CHECK_SNIPPET} />
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>What do popular repos do?</PanelHeading>
          <p className={PROSE}>
            On {formatDay(C.date)} we read the whole file tree of {C.repos} GitHub repos on our board.{" "}
            <strong className="text-ink">
              {C.rootAgentsMdOnly} had only a root AGENTS.md, {C.rootClaudeMdOnly} only a root CLAUDE.md, and{" "}
              {C.rootBoth} both
            </strong>
            : {C.claudeImportsAgents} import AGENTS.md from CLAUDE.md, {C.rootBothLinked} use a symlink and{" "}
            {C.twoUnlinkedFiles} keep two separate files.
          </p>
          <p className={`${PROSE} mt-3`}>
            Our{" "}
            <IntentLink href={checkPath(SIGNAL_ID)} className="prose-link">
              AGENTS.md check
            </IntentLink>{" "}
            passes either name; the choice only changes which agents find it.{" "}
            <IntentLink href={checkSubPath(SIGNAL_ID, "examples")} className="prose-link">
              Read both kinds
            </IntentLink>{" "}
            in popular repos. For other agents:{" "}
            {Object.entries(VS_AGENTS_MD).map(([id, c], i) => (
              <span key={id}>
                {i > 0 && ", "}
                <IntentLink href={checkSubPath(id, "vs-agents-md")} className={LINK}>
                  {c.name} vs AGENTS.md
                </IntentLink>
              </span>
            ))}
            .
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <FaqSection heading="Questions people ask" items={VS_CLAUDE_MD_FAQ} />
      </div>

      <p className="mt-5 mb-0 text-[13px] text-muted">
        From the docs:{" "}
        {distinctSourceLabels(VS_CLAUDE_MD_SOURCES).map((label, i) => (
          <span key={VS_CLAUDE_MD_SOURCES[i]}>
            {i > 0 && " · "}
            <ExternalLink href={VS_CLAUDE_MD_SOURCES[i]} title={VS_CLAUDE_MD_SOURCES[i]}>
              {label}
            </ExternalLink>
          </span>
        ))}
      </p>
    </>
  );
}

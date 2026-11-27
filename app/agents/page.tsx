import type { Metadata } from "next";
import Link from "next/link";
import { AgentReadsView } from "@/components/AgentReadsView";
import { AgentsMdFaq } from "@/components/AgentsMdFaq";
import { ComparePairsView } from "@/components/ComparePairsView";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { LINK } from "@/components/link-class";
import { OtherToolsTable } from "@/components/OtherToolsTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { PROSE } from "@/components/prose-class";
import { SupportMatrixView } from "@/components/SupportMatrixView";
import { AGENT_READS, agentsUsingAgentsMd, OTHER_TOOLS } from "@/lib/agent-reads";
import { pairSplit } from "@/lib/agent-scores";
import { getScoredRepos } from "@/lib/agent-scores-data";
import { MATRIX_COLUMNS, supportMatrix } from "@/lib/agent-support-matrix";
import { AGENT_DOCS_CHECKED, agentsMdFaq } from "@/lib/agents-faq";
import { AUTHOR_JSON_LD } from "@/lib/author";
import { COMPARE_PAIRS } from "@/lib/compare-pairs";
import { CENSUS_SUMMARY } from "@/lib/file-census";
import { getInstructionFileCounts } from "@/lib/leaderboard-files";
import { sourceLabel } from "@/lib/leaderboard-model-panel";
import { agentsModified } from "@/lib/page-dates";
import { PAGE_COPY, staticPageMetadata } from "@/lib/page-meta";
import { MODELS } from "@/lib/scoring/weights";
import { PUBLISHER_JSON_LD } from "@/lib/site-json-ld";
import { agentList } from "@/lib/utils/agent-list";
import { checkPath, checkSubPath } from "@/lib/utils/check-path";
import { formatDay, percent } from "@/lib/utils/format";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { APP_URL, DEFAULT_OG_IMAGE } from "@/lib/version";

export const metadata: Metadata = staticPageMetadata("/agents");

const PATH = "/agents";
const CODE = "font-mono text-[13px] text-ink";

export default function AgentsPage() {
  const counts = getInstructionFileCounts();
  const always = agentsUsingAgentsMd("always");
  const viaSetting = agentsUsingAgentsMd("setting");
  const faqs = agentsMdFaq();
  const modified = agentsModified();

  return (
    <>
      <JsonLd
        data={{
          "@type": "TechArticle",
          headline: PAGE_COPY[PATH].title,
          description: PAGE_COPY[PATH].description,
          url: `${APP_URL}${PATH}`,
          image: `${APP_URL}${DEFAULT_OG_IMAGE.url}`,
          about: MODELS.map((m) => ({ "@type": "Thing", name: m.label })),
          datePublished: "2026-10-21",
          dateModified: modified,
          author: AUTHOR_JSON_LD,
          publisher: PUBLISHER_JSON_LD,
        }}
      />
      <PageHeader
        crumbs={{ current: { name: "Agents", path: PATH } }}
        title={PAGE_COPY[PATH].title}
        updated={modified}
        lead={
          <>
            Most agents read AGENTS.md: {agentList(always)}. Claude Code reads CLAUDE.md and falls back to AGENTS.md.{" "}
            {agentList(viaSetting)} read their own files, and AGENTS.md only when configured to. Checked against each
            agent&apos;s docs on {formatDay(AGENT_DOCS_CHECKED)}. How repos are set up for each, side by side:{" "}
            <Link href="#compare" className="prose-link">
              compare agents
            </Link>
            .
          </>
        }
      />

      <Panel>
        <PanelHeading>Which agents read which file</PanelHeading>
        <SupportMatrix />
        <p className={`${PROSE} mt-3 text-[13px]`}>
          Each cell links the agent&apos;s docs. Fallback: read only when CLAUDE.md is missing. Setting: read once
          configured. —: the docs don&apos;t say. The last row is the share of {CENSUS_SUMMARY.repos} popular GitHub
          repos with the file, at any depth, on {formatDay(CENSUS_SUMMARY.date)}.
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Files each agent reads</PanelHeading>
          <AgentReadsView
            rows={MODELS.map((m) => {
              const reads = AGENT_READS[m.id];
              return {
                id: m.id,
                files: reads.files,
                note: reads.note,
                sources: [...m.sources, ...(reads.sources ?? [])].map((url): [string, string] => [
                  url,
                  sourceLabel(url),
                ]),
              };
            })}
          />
        </Panel>
      </div>

      <div id="compare" className="mt-3.5 scroll-mt-20">
        <ComparePairs />
      </div>

      <div className="mt-3.5">
        <OtherToolsTable tools={OTHER_TOOLS} />
      </div>

      <div className="mt-3.5">
        <AgentsMdFaq faqs={faqs} checked={AGENT_DOCS_CHECKED} />
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>How do I write one file every agent reads?</PanelHeading>
          <ol className="m-0 ml-5 list-decimal text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              Write it in <code className={CODE}>AGENTS.md</code> at the repo root.{" "}
              <Link href={checkPath("agents_md")} className="prose-link">
                What to put in it
              </Link>
              .
            </li>
            <li>
              If you keep a CLAUDE.md, import <code className={CODE}>@AGENTS.md</code> in it, or Claude Code skips
              AGENTS.md.{" "}
              <Link href={checkSubPath("agents_md", "vs-claude-md")} className="prose-link">
                AGENTS.md vs CLAUDE.md
              </Link>
              .
            </li>
            <li>
              Aider: list AGENTS.md under <code className={CODE}>read:</code> in{" "}
              <code className={CODE}>.aider.conf.yml</code>. Gemini CLI: add it to{" "}
              <code className={CODE}>context.fileName</code>, or keep a GEMINI.md.
            </li>
            <li>
              Cursor rules go in <code className={CODE}>.cursor/rules/</code>, OpenHands setup in{" "}
              <code className={CODE}>.openhands/setup.sh</code>.
            </li>
            <li>
              Longer task steps go in <code className={CODE}>.agents/skills/</code>, which every agent here but Claude
              Code and Aider loads when a task matches.{" "}
              <Link href={checkPath("agent_skills")} className="prose-link">
                Agent skills
              </Link>
              .
            </li>
          </ol>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>How many repos have each file?</PanelHeading>
          <ul className="link-list">
            {counts.files.map((f) => (
              <li key={f.file} className="flex items-baseline justify-between gap-3 link-row">
                <IntentLink href={checkPath(f.signalId)} className={`${LINK} cover-link`}>
                  <code className={CODE}>{f.file}</code>
                  {f.qualifier && ` ${f.qualifier}`}
                </IntentLink>
                <span className="tabular-nums">
                  {f.count} of {counts.total} ({percent(f.count, counts.total)})
                </span>
              </li>
            ))}
          </ul>
          <p className={`${PROSE} mt-3 text-[13px]`}>
            A repo with both files counts under AGENTS.md unless it is empty; empty files don&apos;t count.{" "}
            <Link href={checkSubPath("agents_md", "examples")} className="prose-link">
              Read the files
            </Link>
            .
          </p>
        </Panel>
      </div>

      <p className="mt-5 mb-0 text-[13px] text-muted">
        Agent names link to their boards. The{" "}
        <Link href="/methodology" className="prose-link">
          methodology
        </Link>{" "}
        has every weight; the{" "}
        <Link href="/guide" className="prose-link">
          guide
        </Link>{" "}
        covers the rest of an agent-ready repo.
      </p>
    </>
  );
}

function SupportMatrix() {
  const docs: string[] = [];
  const docIndex = (url: string | null) => {
    if (url == null) return -1;
    const i = docs.indexOf(url);
    return i >= 0 ? i : docs.push(url) - 1;
  };
  const rows = supportMatrix().map((r) => ({
    label: r.label,
    href: r.modelId ? modelPath(r.modelId) : null,
    cells: r.cells.map((c) => [c.value, docIndex(c.doc)] as [typeof c.value, number]),
  }));
  const columns = MATRIX_COLUMNS.map((c) => ({
    label: c.label,
    share: percent(c.repos(CENSUS_SUMMARY), CENSUS_SUMMARY.repos),
  }));
  return <SupportMatrixView columns={columns} docs={docs} rows={rows} reposLabel="Repos with it" />;
}

function ComparePairs() {
  const rows = getScoredRepos();
  return (
    <Panel>
      <PanelHeading>How do repos score for each pair of agents?</PanelHeading>
      <ComparePairsView
        pairs={COMPARE_PAIRS.map(({ a, b }) => {
          const s = pairSplit(rows, a, b);
          // Rounded as shown, so the payload carries no float tail.
          return {
            a,
            b,
            avgA: Number(s.avgA.toFixed(1)),
            avgB: Number(s.avgB.toFixed(1)),
            aHigher: s.aHigher,
            bHigher: s.bHigher,
          };
        })}
      />
      <p className={`${PROSE} mt-3 text-[13px]`}>
        Averages over the board&apos;s repos scored for both agents. &ldquo;Higher for each&rdquo; counts the repos that
        score higher for the first agent, then the second; the rest tie. Scores measure how well a repo is set up for an
        agent, not which agent writes better code.
      </p>
    </Panel>
  );
}

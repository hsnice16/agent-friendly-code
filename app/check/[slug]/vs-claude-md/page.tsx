import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ExternalLink } from "@/components/ExternalLink";
import { JsonLd } from "@/components/JsonLd";
import { Panel, PanelHeading } from "@/components/Panel";
import { AGENT_READS, type AgentsMdUse, agentsUsingAgentsMd } from "@/lib/agent-reads";
import { getLeaderboardStats } from "@/lib/db";
import { getInstructionFileCounts } from "@/lib/leaderboard-files";
import { AGENTS_VS_CLAUDE_MD } from "@/lib/page-meta";
import { SIGNAL_BY_ID } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { checkPath, checkSlug, checkSubPath } from "@/lib/utils/check-path";
import { percent } from "@/lib/utils/format";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { pageTitle } from "@/lib/utils/page-title";
import { APP_NAME, APP_URL, DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const SIGNAL_ID = "agents_md";
const PATH = checkSubPath(SIGNAL_ID, "vs-claude-md");
const CLAUDE_DOCS = "https://code.claude.com/docs/en/memory#agents-md";

const { title: TITLE, description: DESCRIPTION } = AGENTS_VS_CLAUDE_MD;

const PROSE = "m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim";
const LINK = "text-ink hover:text-ink-soft";
const CODE = "font-mono text-[13px] text-ink";

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

  const { contentChangedAt } = getLeaderboardStats();
  const counts = getInstructionFileCounts();
  const countOf = (file: string) => counts.files.find((f) => f.file === file)?.count ?? 0;
  const agentsMdReaders = agentsUsingAgentsMd("always");

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
          ...(contentChangedAt != null ? { dateModified: new Date(contentChangedAt * 1000).toISOString() } : {}),
          author: { "@id": `${APP_URL}/about#author` },
          publisher: { "@type": "Organization", name: APP_NAME, url: APP_URL },
        }}
      />
      <Breadcrumbs
        parents={[
          { name: "Checks", path: "/check" },
          { name: SIGNAL_BY_ID[SIGNAL_ID].label, path: checkPath(SIGNAL_ID) },
        ]}
        current={{ name: "AGENTS.md vs CLAUDE.md", path: PATH }}
      />

      <section className="mb-7">
        <h1 className="mb-2.5 text-[28px] font-bold leading-[1.18] tracking-tight">{TITLE}</h1>
        <p className="m-0 mb-3 max-w-[72ch] text-[15.5px] leading-relaxed text-ink">
          Use AGENTS.md: {agentsMdReaders.length} of the {MODELS.length} agents we score read it, and Claude Code falls
          back to it. If you also need a CLAUDE.md, start it with <code className={CODE}>@AGENTS.md</code>, or Claude
          Code skips AGENTS.md.
        </p>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          Both hold the same content. AGENTS.md is the shared name; CLAUDE.md is Claude Code&apos;s.
        </p>
      </section>

      <Panel>
        <PanelHeading>Which agents read AGENTS.md and which read CLAUDE.md?</PanelHeading>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[14px]">
            <caption className="sr-only">Whether each AI coding agent reads AGENTS.md and CLAUDE.md</caption>
            <thead>
              <tr className="border-b border-line text-[12.5px] text-muted">
                <th scope="col" className="py-2 pr-4 font-medium">
                  Agent
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  AGENTS.md
                </th>
                <th scope="col" className="py-2 font-medium">
                  CLAUDE.md
                </th>
              </tr>
            </thead>
            <tbody className="text-ink-dim">
              {MODELS.map((m) => (
                <tr key={m.id} className="border-b border-line last:border-b-0">
                  <th scope="row" className="py-2 pr-4 font-medium">
                    <Link href={modelPath(m.id)} className={LINK}>
                      {m.label}
                    </Link>
                  </th>
                  <td className="py-2 pr-4">{AGENTS_MD_CELL[AGENT_READS[m.id].agentsMd]}</td>
                  <td className="py-2">{AGENT_READS[m.id].claudeMd ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={`${PROSE} mt-3 text-[13px]`}>
          <Link href="/agents" className={LINK}>
            Every file each agent reads
          </Link>
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
            Needs Claude Code v2.1.277 or later. A CLAUDE.local.md counts as a CLAUDE.md.{" "}
            <ExternalLink href={CLAUDE_DOCS} title={CLAUDE_DOCS}>
              Claude Code&apos;s docs
            </ExternalLink>{" "}
            also cover a setting that loads both.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>How many repos use AGENTS.md and how many use CLAUDE.md?</PanelHeading>
          <p className={PROSE}>
            Of {counts.total} leaderboard repos,{" "}
            <strong className="text-ink">
              {countOf("AGENTS.md")} have an AGENTS.md ({percent(countOf("AGENTS.md"), counts.total)})
            </strong>{" "}
            and {countOf("CLAUDE.md")} only a CLAUDE.md ({percent(countOf("CLAUDE.md"), counts.total)}). Empty files
            don&apos;t count.
          </p>
          <p className={`${PROSE} mt-3`}>
            Our{" "}
            <Link href={checkPath(SIGNAL_ID)} className={LINK}>
              AGENTS.md check
            </Link>{" "}
            passes either name; the choice only changes which agents find it.{" "}
            <Link href={checkSubPath(SIGNAL_ID, "examples")} className={LINK}>
              Read both kinds
            </Link>{" "}
            in popular repos.
          </p>
        </Panel>
      </div>
    </>
  );
}

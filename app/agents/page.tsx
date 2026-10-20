import type { Metadata } from "next";
import Link from "next/link";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { CodeText } from "@/components/CodeText";
import { ExternalLink } from "@/components/ExternalLink";
import { JsonLd } from "@/components/JsonLd";
import { Panel, PanelHeading } from "@/components/Panel";
import { AGENT_READS, agentsUsingAgentsMd } from "@/lib/agent-reads";
import { getLeaderboardStats } from "@/lib/db";
import { getInstructionFileCounts } from "@/lib/leaderboard-files";
import { sourceLabel } from "@/lib/leaderboard-model-panel";
import { PAGE_COPY, staticPageMetadata } from "@/lib/page-meta";
import { MODELS } from "@/lib/scoring/weights";
import { agentList } from "@/lib/utils/agent-list";
import { checkPath, checkSubPath } from "@/lib/utils/check-path";
import { percent } from "@/lib/utils/format";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { APP_NAME, APP_URL, DEFAULT_OG_IMAGE } from "@/lib/version";

export const metadata: Metadata = staticPageMetadata("/agents");

const PATH = "/agents";
const PROSE = "m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim";
const LINK = "text-ink hover:text-ink-soft";
const CODE = "font-mono text-[13px] text-ink";

export default function AgentsPage() {
  const { contentChangedAt } = getLeaderboardStats();
  const counts = getInstructionFileCounts();
  const always = agentsUsingAgentsMd("always");
  const viaSetting = agentsUsingAgentsMd("setting");

  return (
    <>
      <JsonLd
        data={{
          "@type": "TechArticle",
          headline: PAGE_COPY[PATH].title,
          description: PAGE_COPY[PATH].description,
          url: `${APP_URL}${PATH}`,
          image: `${APP_URL}${DEFAULT_OG_IMAGE.url}`,
          about: MODELS.map((m) => ({ "@type": "SoftwareApplication", name: m.label })),
          ...(contentChangedAt != null ? { dateModified: new Date(contentChangedAt * 1000).toISOString() } : {}),
          author: { "@id": `${APP_URL}/about#author` },
          publisher: { "@type": "Organization", name: APP_NAME, url: APP_URL },
        }}
      />
      <BreadcrumbJsonLd current={{ name: "Agents", path: PATH }} />

      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[28px] font-bold leading-[1.18] tracking-tight">{PAGE_COPY[PATH].title}</h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] leading-relaxed text-ink">
          Most agents read AGENTS.md: {agentList(always)}. Claude Code reads CLAUDE.md and falls back to AGENTS.md.{" "}
          {agentList(viaSetting)} read their own files, and AGENTS.md only when configured to.
        </p>
      </section>

      <Panel>
        <PanelHeading>Which files does each agent read?</PanelHeading>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left text-[14px]">
            <caption className="sr-only">Repo files each AI coding agent reads</caption>
            <thead>
              <tr className="border-b border-line text-[12.5px] text-muted">
                <th scope="col" className="py-2 pr-4 font-medium">
                  Agent
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Reads from the repo
                </th>
                <th scope="col" className="py-2 font-medium">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m) => {
                const reads = AGENT_READS[m.id];
                return (
                  <tr key={m.id} className="border-b border-line align-top last:border-b-0">
                    <th scope="row" className="py-2.5 pr-4 font-medium">
                      <Link href={modelPath(m.id)} className={LINK}>
                        {m.label}
                      </Link>
                    </th>
                    <td className="py-2.5 pr-4">
                      <ul className="m-0 list-none p-0">
                        {reads.files.map((f) => (
                          <li key={f}>
                            <code className={CODE}>{f}</code>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-2.5 text-ink-dim">
                      <CodeText text={reads.note} />{" "}
                      {[...m.sources, ...(reads.sources ?? [])].map((url) => (
                        <span key={url} className="mr-2 text-[12.5px]">
                          <ExternalLink href={url} title={url}>
                            {sourceLabel(url)}
                          </ExternalLink>
                        </span>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>How do I write one file every agent reads?</PanelHeading>
          <ol className="m-0 ml-5 list-decimal text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              Write it in <code className={CODE}>AGENTS.md</code> at the repo root.{" "}
              <Link href={checkPath("agents_md")} className={LINK}>
                What to put in it
              </Link>
              .
            </li>
            <li>
              If you keep a CLAUDE.md, start it with <code className={CODE}>@AGENTS.md</code>, or Claude Code skips
              AGENTS.md.{" "}
              <Link href={checkSubPath("agents_md", "vs-claude-md")} className={LINK}>
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
              Cursor-only rules go in <code className={CODE}>.cursor/rules/</code>, OpenHands setup in{" "}
              <code className={CODE}>.openhands/setup.sh</code>.
            </li>
          </ol>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>How many repos have each file?</PanelHeading>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[14.5px] text-ink-dim">
            {counts.files.map((f) => (
              <li key={f.file} className="flex items-baseline justify-between gap-3">
                <Link href={checkPath(f.signalId)} className={LINK}>
                  <code className={CODE}>{f.file}</code>
                </Link>
                <span className="tabular-nums">
                  {f.count} of {counts.total} ({percent(f.count, counts.total)})
                </span>
              </li>
            ))}
          </ul>
          <p className={`${PROSE} mt-3 text-[13px]`}>
            A repo with both files counts under AGENTS.md unless it is empty; empty files don&apos;t count.{" "}
            <Link href={checkSubPath("agents_md", "examples")} className={LINK}>
              Read the files
            </Link>
            .
          </p>
        </Panel>
      </div>

      <p className="mt-5 mb-0 text-[13px] text-muted">
        Agent names link to their boards. The{" "}
        <Link href="/methodology" className={LINK}>
          methodology
        </Link>{" "}
        has every weight.
      </p>
    </>
  );
}

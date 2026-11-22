import type { Metadata } from "next";

import { CodeText } from "@/components/CodeText";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { LINK, LINK_STRONG } from "@/components/link-class";
import { PAGE_LEAD, PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { examplesByLanguage } from "@/lib/agents-md-examples";
import { examplesByFramework } from "@/lib/agents-md-frameworks";
import { AUTHOR_JSON_LD } from "@/lib/author";
import { VS_AGENTS_MD } from "@/lib/check-content/vs-agents-md";
import { getCheckStats } from "@/lib/check-stats";
import { START_WITH_CHECKS as START_WITH } from "@/lib/constants/scoring";
import { getLeaderboardStats } from "@/lib/db";
import { FILE_CHECKS, GUIDE_THEMES } from "@/lib/guide-content";
import { guideExplainers } from "@/lib/guide-explainers";
import { GUIDE_NOTES, GUIDES } from "@/lib/guides";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { checksBySummedWeight } from "@/lib/leaderboard-model-panel";
import { PAGE_COPY, staticPageMetadata } from "@/lib/page-meta";
import { SIGNAL_BY_ID, SIGNALS } from "@/lib/scoring/signals";
import { checkPath, checkSubPath, frameworkExamplesPath, languageExamplesPath } from "@/lib/utils/check-path";
import { COMPARE_PATH } from "@/lib/utils/compare-path";
import { CONTRIBUTE_PATH } from "@/lib/utils/contribute-path";
import { percent } from "@/lib/utils/format";
import { GENERATOR_PATH } from "@/lib/utils/generator-path";
import { GUIDE_PATH, guidePath } from "@/lib/utils/guide-path";
import { AI_POLICY_REPORT_PATH, REPORT_PATH, REPORT_TITLE, SIZE_REPORT_PATH } from "@/lib/utils/report-path";
import { APP_NAME, APP_URL, DEFAULT_OG_IMAGE } from "@/lib/version";

const PATH = GUIDE_PATH;

const PROSE = "m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim";

export const metadata: Metadata = staticPageMetadata(PATH);

const AGENT_FILES = [
  { href: "/agents", label: "Which files each agent reads", note: "per agent, from its docs" },
  { href: checkSubPath("agents_md", "vs-claude-md"), label: "AGENTS.md vs CLAUDE.md", note: "for Claude Code" },
  ...Object.entries(VS_AGENTS_MD).map(([id, c]) => ({
    href: checkSubPath(id, "vs-agents-md"),
    label: `${c.name} vs AGENTS.md`,
    note: `for ${c.agent}`,
  })),
  ...GUIDES.map((g) => ({ href: guidePath(g.slug), label: g.name, note: GUIDE_NOTES[g.slug] ?? "guide" })),
];

const DATA_PAGES = [
  { href: COMPARE_PATH, label: "Compare agents", note: "how repos are set up for each, pair by pair" },
  { href: REPORT_PATH, label: REPORT_TITLE, note: "how adoption has grown" },
  { href: SIZE_REPORT_PATH, label: "How long AGENTS.md files are", note: "sizes of real files" },
  { href: AI_POLICY_REPORT_PATH, label: "AI contribution policies", note: "what projects allow" },
  { href: CONTRIBUTE_PATH, label: "Projects to contribute to", note: "ready for agent-assisted work" },
];

const TOOLS = [
  { href: "/score", label: "Live Score", note: "paste a public GitHub URL" },
  { href: GENERATOR_PATH, label: "AGENTS.md generator", note: "a starter drafted from the scan" },
  { href: "/skill", label: "Agent Skill", note: "scores the repo you're in, locally" },
  { href: "/action", label: "GitHub Action", note: "comments the score change on every pull request" },
];

export default function GuidePage() {
  const { contentChangedAt } = getLeaderboardStats();
  const { title, description } = PAGE_COPY[PATH];
  const agentsMd = getCheckStats("agents_md");
  const passRate = (id: string) => {
    const s = getCheckStats(id);
    return percent(s.full, s.total);
  };
  const startHere = new Set(checksBySummedWeight(START_WITH).map((c) => c.id));
  const ex = getAgentsMdExamples();

  return (
    <>
      <JsonLd
        data={{
          "@type": "TechArticle",
          headline: title,
          description,
          url: `${APP_URL}${PATH}`,
          image: `${APP_URL}${DEFAULT_OG_IMAGE.url}`,
          about: [
            { "@type": "Thing", name: "AI coding agents" },
            { "@type": "Thing", name: "AGENTS.md" },
          ],
          datePublished: "2026-11-04",
          hasPart: SIGNALS.map((s) => ({ "@type": "WebPage", name: s.label, url: `${APP_URL}${checkPath(s.id)}` })),
          ...(contentChangedAt != null ? { dateModified: new Date(contentChangedAt * 1000).toISOString() } : {}),
          author: AUTHOR_JSON_LD,
          publisher: { "@type": "Organization", name: APP_NAME, url: APP_URL },
        }}
      />
      {/* The meta title carries the search wording ("best practices", "AI-ready"); the heading reads as a how-to. */}
      <PageHeader
        crumbs={{ current: { name: "Guide", path: PATH } }}
        title="How to make your codebase agent-friendly"
        lead={
          <>
            An agent-friendly, AI-ready codebase writes down what the code doesn&apos;t say and gives the agent a way to
            check its work: an AGENTS.md with your exact commands, tests it can run, and CI and lint config that show
            what a change must pass.
          </>
        }
      >
        <p className={`mt-2.5 ${PAGE_LEAD}`}>
          Of {agentsMd.total} popular repos on our leaderboard, {percent(agentsMd.present, agentsMd.total)} have an
          AGENTS.md or CLAUDE.md (
          <IntentLink href={REPORT_PATH} className="prose-link">
            how that has grown
          </IntentLink>
          ), {passRate("tests")} pass our tests check and {passRate("ci")} our CI check. Below are the {SIGNALS.length}{" "}
          best practices we score, grouped by what they do for an agent; the {START_WITH} marked count most across
          agents.
        </p>
      </PageHeader>

      <div className="flex flex-col gap-3.5">
        {GUIDE_THEMES.map((theme) => (
          <Panel key={theme.id}>
            <PanelHeading>{theme.title}</PanelHeading>
            <p className={`${PROSE} mb-3`}>{theme.intro}</p>
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0 text-[14.5px] leading-relaxed text-ink-dim">
              {theme.checks.map((c) => {
                const s = getCheckStats(c.id);
                return (
                  <li
                    key={c.id}
                    className="flex flex-col gap-x-4 link-row sm:flex-row sm:items-baseline sm:justify-between"
                  >
                    <span>
                      <IntentLink href={checkPath(c.id)} className={`${LINK_STRONG} cover-link`}>
                        {SIGNAL_BY_ID[c.id].label}
                      </IntentLink>
                      {startHere.has(c.id) && (
                        <span className="ml-2 text-[12.5px] font-medium text-tip">start here</span>
                      )}
                      <span className="block">
                        <CodeText text={c.action} />
                      </span>
                    </span>
                    <span className="shrink-0 text-[13px] tabular-nums text-muted">
                      {FILE_CHECKS.has(c.id)
                        ? `${percent(s.present, s.total)} of repos have one`
                        : `${percent(s.full, s.total)} of repos pass`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>
        ))}

        <div className="grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
          <Panel className="h-full">
            <PanelHeading>Which file does my agent read?</PanelHeading>
            <ul className="link-list">
              {AGENT_FILES.map((l) => (
                <li key={l.href} className="link-row">
                  <IntentLink href={l.href} className={`${LINK} cover-link`}>
                    {l.label}
                  </IntentLink>
                  : {l.note}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="h-full">
            <PanelHeading>How ready is my repo?</PanelHeading>
            <ul className="link-list">
              {TOOLS.map((l) => (
                <li key={l.href} className="link-row">
                  <IntentLink href={l.href} className={`${LINK} cover-link`}>
                    {l.label}
                  </IntentLink>
                  : {l.note}
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel>
          <PanelHeading>AGENTS.md examples to copy</PanelHeading>
          <p className={PROSE}>
            <IntentLink href={checkSubPath("agents_md", "examples")} className={LINK}>
              All {ex.rows.length} on the leaderboard
            </IntentLink>
            , or by language and framework:
          </p>
          <ul className="mt-2 mb-0 flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0 text-[14px] text-ink-dim">
            {examplesByFramework(ex).map((f) => (
              <li key={f.guide.slug}>
                <IntentLink href={frameworkExamplesPath(f.guide.slug)} className={LINK}>
                  {f.guide.label}
                </IntentLink>
              </li>
            ))}
            {examplesByLanguage(ex).map((l) => (
              <li key={l.slug}>
                <IntentLink href={languageExamplesPath(l.slug)} className={LINK}>
                  {l.label}
                </IntentLink>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <PanelHeading>What does the data say?</PanelHeading>
          <ul className="link-list">
            {DATA_PAGES.map((l) => (
              <li key={l.href} className="link-row">
                <IntentLink href={l.href} className={`${LINK} cover-link`}>
                  {l.label}
                </IntentLink>
                : {l.note}
              </li>
            ))}
          </ul>
        </Panel>
        <div className="grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
          {guideExplainers(SIGNALS.length).map((e) => (
            <Panel key={e.question} className="h-full">
              <PanelHeading>{e.question}</PanelHeading>
              <p className={PROSE}>
                <CodeText text={e.answer} />{" "}
                <IntentLink href={e.link.href} className="prose-link">
                  {e.link.label}
                </IntentLink>
                .
              </p>
            </Panel>
          ))}
        </div>
      </div>

      <p className="mt-5 mb-0 text-[13px] text-muted">
        Shares are of the {agentsMd.total} leaderboard repos; empty files don&apos;t count. How each agent weighs the
        checks:{" "}
        <IntentLink href="/methodology" className="prose-link">
          methodology
        </IntentLink>
        .
      </p>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { CiteThis } from "@/components/CiteThis";
import { ExternalLink } from "@/components/ExternalLink";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { LINK } from "@/components/link-class";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { PROSE } from "@/components/prose-class";
import { ReportStat } from "@/components/ReportStat";
import { agentsReading } from "@/lib/agent-reads";
import { getAgentSkillsReport } from "@/lib/agent-skills-data";
import {
  type AgentSkillsReport,
  agentSkillsDescription,
  agentSkillsTitle,
  type SkillRepo,
} from "@/lib/agent-skills-report";
import { AUTHOR_JSON_LD } from "@/lib/author";
import { MODELS } from "@/lib/scoring/weights";
import { PUBLISHER_JSON_LD } from "@/lib/site-json-ld";
import { checkPath } from "@/lib/utils/check-path";
import { compactStars, formatDay, percent } from "@/lib/utils/format";
import { guidePath } from "@/lib/utils/guide-path";
import { ogImage } from "@/lib/utils/og-image";
import { pageTitle } from "@/lib/utils/page-title";
import { repoPath } from "@/lib/utils/repo-path";
import { SKILLS_REPORT_CSV_PATH, SKILLS_REPORT_PATH } from "@/lib/utils/report-path";
import { APP_NAME, APP_URL, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const CODE = "font-mono text-[13px] text-ink";
const TOP = 25;
const ELSEWHERE_NAMED = 6;

export function generateMetadata(): Metadata {
  const r = getAgentSkillsReport();
  const title = agentSkillsTitle(r);
  const description = agentSkillsDescription(r);
  const image = ogImage(SKILLS_REPORT_PATH, title);
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: SKILLS_REPORT_PATH },
    twitter: { ...TWITTER_DEFAULTS, images: [image], title, description },
    openGraph: {
      ...OG_DEFAULTS,
      images: [image],
      title,
      description,
      url: SKILLS_REPORT_PATH,
      type: "article",
    },
  };
}

function jsonLd(r: AgentSkillsReport) {
  const url = `${APP_URL}${SKILLS_REPORT_PATH}`;
  return {
    "@graph": [
      {
        "@type": "TechArticle",
        headline: agentSkillsTitle(r),
        description: agentSkillsDescription(r),
        url,
        image: `${APP_URL}${ogImage(SKILLS_REPORT_PATH, agentSkillsTitle(r)).url}`,
        dateModified: r.date,
        author: AUTHOR_JSON_LD,
        publisher: PUBLISHER_JSON_LD,
        about: [{ "@type": "Thing", name: "Agent skills (SKILL.md)" }],
      },
      {
        "@type": "Dataset",
        "@id": `${url}#dataset`,
        name: `${agentSkillsTitle(r)}, per repo`,
        description: `SKILL.md files under .agents/skills and .claude/skills in ${r.repos} GitHub repos on the ${APP_NAME} leaderboard, read from each repo's file tree.`,
        url,
        keywords: ["agent skills", "SKILL.md", ".agents/skills", ".claude/skills", "open source"],
        isAccessibleForFree: true,
        dateModified: r.date,
        creator: PUBLISHER_JSON_LD,
        license: "https://opensource.org/licenses/MIT",
        distribution: {
          "@type": "DataDownload",
          encodingFormat: "text/csv",
          contentUrl: `${APP_URL}${SKILLS_REPORT_CSV_PATH}`,
        },
        isPartOf: { "@id": `${APP_URL}/#dataset` },
      },
    ],
  };
}

function RepoLink({ r, className }: { r: SkillRepo; className: string }) {
  const label = `${r.owner}/${r.name}`;
  return r.board ? (
    <IntentLink href={repoPath(r.board)} className={className}>
      {label}
    </IntentLink>
  ) : (
    <span>{label}</span>
  );
}

export default function AgentSkillsReportPage() {
  const r = getAgentSkillsReport();
  const day = formatDay(r.date);
  const top = r.rows.slice(0, TOP);
  const rest = r.rows.slice(TOP);
  const first = r.trend[0];
  const last = r.trend[r.trend.length - 1];

  return (
    <>
      <JsonLd data={jsonLd(r)} />
      <PageHeader
        crumbs={{ current: { name: "Agent skills", path: SKILLS_REPORT_PATH } }}
        title={agentSkillsTitle(r)}
        lead={
          <>
            <strong className="text-ink">
              {r.rows.length} of the {r.repos} popular GitHub repos on our board ({percent(r.rows.length, r.repos)})
              ship project skills
            </strong>
            : <code className={CODE}>SKILL.md</code> files an agent loads when a task matches, {r.agents} under{" "}
            <code className={CODE}>.agents/skills/</code> and {r.claude} under{" "}
            <code className={CODE}>.claude/skills/</code> ({r.both} use both). Read from each repo&apos;s file tree on{" "}
            {day}.
          </>
        }
        updated={r.date}
      />

      <div className="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2 lg:grid-cols-4">
        <ReportStat
          label="Ship project skills"
          value={percent(r.rows.length, r.repos)}
          note={`${r.rows.length} of ${r.repos} repos`}
        />
        <ReportStat
          label=".agents/skills"
          value={String(r.agents)}
          note={`read by ${agentsReading(".agents/skills/").length} of the ${MODELS.length} agents we score`}
        />
        <ReportStat label=".claude/skills" value={String(r.claude)} note="Claude Code's own directory" />
        <ReportStat
          label="Skills per repo"
          value={String(r.medianSkills ?? 0)}
          note={`median; ${r.skillFiles.toLocaleString("en")} SKILL.md files in all`}
        />
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Repos with the most skills</PanelHeading>
          {/* biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region */}
          <section className="table-wrap" tabIndex={0} aria-label="Repos with the most agent skills">
            <table className="data-table min-w-[480px] text-[14px]">
              <caption className="sr-only">
                Popular repos by number of SKILL.md files under .agents/skills and .claude/skills
              </caption>
              <thead>
                <tr>
                  <th scope="col">Repo</th>
                  <th scope="col" className="text-right normal-case">
                    .agents/skills
                  </th>
                  <th scope="col" className="text-right normal-case">
                    .claude/skills
                  </th>
                  <th scope="col" className="text-right">
                    Stars
                  </th>
                </tr>
              </thead>
              <tbody>
                {top.map((s) => (
                  <tr key={`${s.host}/${s.owner}/${s.name}`}>
                    <th scope="row" className="font-medium">
                      <RepoLink r={s} className={`${LINK} cover-link`} />
                    </th>
                    <td className="text-right tabular-nums">
                      {s.agentsDirUrl ? <ExternalLink href={s.agentsDirUrl}>{s.agents}</ExternalLink> : s.agents || "—"}
                    </td>
                    <td className="text-right tabular-nums">{s.claude || "—"}</td>
                    <td className="text-right tabular-nums text-ink-dim">{compactStars(s.stars, false)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          {rest.length > 0 && (
            <p className={`${PROSE} mt-4 text-[14px]`}>
              Also shipping skills ({rest.length}):{" "}
              {rest.map((s, i) => (
                <span key={`${s.host}/${s.owner}/${s.name}`}>
                  {i > 0 && ", "}
                  <RepoLink r={s} className="prose-link" />
                </span>
              ))}
              .
            </p>
          )}
          <p className="mt-3 mb-0 text-[13px] text-muted">
            Every repo with its counts:{" "}
            <a href={SKILLS_REPORT_CSV_PATH} className="prose-link">
              agent-skills.csv
            </a>
            . A linked count opens the repo&apos;s root <code className={CODE}>.agents/skills/</code>.
          </p>
        </Panel>
      </div>

      {first && last && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>Root .agents/skills over time</PanelHeading>
            <p className={`${PROSE} mb-3`}>
              From {first.count} of {first.repos} repos ({percent(first.count, first.repos)}) on {formatDay(first.date)}{" "}
              to {last.count} of {last.repos} ({percent(last.count, last.repos)}) on {formatDay(last.date)}, from every
              daily rescore. The list grew too, so a step can be a new repo.
            </p>
            <ul className="link-list">
              {r.trend.map((p) => (
                <li key={p.date} className="flex items-baseline justify-between gap-3 link-row">
                  <span>{formatDay(p.date)}</span>
                  <span className="tabular-nums">
                    {p.count} of {p.repos} ({percent(p.count, p.repos)})
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      {r.elsewhereOnly.length > 0 && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>SKILL.md elsewhere</PanelHeading>
            <p className={PROSE}>
              {r.elsewhereOnly.length} more repos keep SKILL.md files only outside those two directories, mostly skills
              they publish for their users rather than for agents working on the repo:{" "}
              {r.elsewhereOnly.slice(0, ELSEWHERE_NAMED).map((s, i) => (
                <span key={`${s.host}/${s.owner}/${s.name}`}>
                  {i > 0 && ", "}
                  <RepoLink r={s} className="prose-link" /> ({s.other})
                </span>
              ))}
              . They aren&apos;t counted above.
            </p>
          </Panel>
        </div>
      )}

      <div className="mt-3.5">
        <Panel tone="tip">
          <PanelHeading tone="tip" icon="puzzle">
            Add skills to your repo
          </PanelHeading>
          <p className={PROSE}>
            One folder per workflow an agent repeats, each with a <code className={CODE}>SKILL.md</code> whose{" "}
            <code className={CODE}>name</code> and <code className={CODE}>description</code> say when to load it.{" "}
            <Link href={checkPath("agent_skills")} className="prose-link">
              What goes in one
            </Link>
            ;{" "}
            <Link href={guidePath("agents-md-vs-skills")} className="prose-link">
              AGENTS.md or a skill
            </Link>
            .
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Methodology</PanelHeading>
          <ul className="m-0 ml-5 flex list-disc flex-col gap-1.5 text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              The sample is the {r.repos} GitHub repos on the leaderboard on {day}; GitLab and Bitbucket weren&apos;t
              read. A SKILL.md counts at any depth, so a monorepo&apos;s package skills count too.
            </li>
            <li>
              The trend is the scored check, which looks only for <code className={CODE}>.agents/skills/</code> at the
              root and covers every host, so its counts differ a little from the table&apos;s.
            </li>
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5">
        <CiteThis title={agentSkillsTitle(r)} path={SKILLS_REPORT_PATH} asOf={day} />
      </div>
    </>
  );
}

"use client";

import { CodeText } from "./CodeText";
import { ExternalLink } from "./ExternalLink";
import { IntentLink } from "./IntentLink";
import { LINK } from "./link-class";
import { Panel, PanelHeading } from "./Panel";

type Dir = { count: number; href: string | null } | null;

export type SkillsCensusRow = { repo: string; href: string | null; agents: Dir; claude: Dir; other: number };

const SOURCES = [
  { href: "https://agentskills.io/specification", label: "Agent Skills spec" },
  { href: "https://github.com/vercel-labs/skills", label: "skills CLI" },
  { href: "https://github.blog/changelog/2026-04-17-manage-agent-skills-with-github-cli/", label: "gh skill" },
];

const NONE = <span className="text-muted">–</span>;

function DirCell({ dir }: { dir: Dir }) {
  if (!dir) return NONE;
  return dir.href ? <ExternalLink href={dir.href}>{dir.count}</ExternalLink> : dir.count;
}

export function SkillsCensusView({ summary, rows }: { summary: string; rows: SkillsCensusRow[] }) {
  return (
    <Panel>
      <PanelHeading>Where do repos keep their skills?</PanelHeading>
      <p className="m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim">
        <CodeText text={summary} />
      </p>
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region */}
      <section className="table-wrap mt-3" tabIndex={0} aria-label="Most-starred repos with skills">
        <table className="data-table text-[14px] tabular-nums">
          <caption className="sr-only">SKILL.md files per directory in the most-starred repos that ship skills</caption>
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
                Elsewhere
              </th>
            </tr>
          </thead>
          <tbody className="text-ink-dim">
            {rows.map((r) => (
              <tr key={r.repo}>
                <th scope="row" className="font-normal">
                  {r.href ? (
                    <IntentLink href={r.href} className={LINK}>
                      {r.repo}
                    </IntentLink>
                  ) : (
                    r.repo
                  )}
                </th>
                <td className="text-right">
                  <DirCell dir={r.agents} />
                </td>
                <td className="text-right">
                  <DirCell dir={r.claude} />
                </td>
                <td className="text-right">{r.other || NONE}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="mt-3 mb-0 text-[13px] text-muted">
        Most-starred first; counts are SKILL.md files.{" "}
        {SOURCES.map((s, i) => (
          <span key={s.href}>
            {i > 0 && " · "}
            <ExternalLink href={s.href}>{s.label}</ExternalLink>
          </span>
        ))}
      </p>
    </Panel>
  );
}

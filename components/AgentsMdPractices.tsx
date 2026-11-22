import { AGENTS_MD_PRACTICES, AGENTS_MD_TEMPLATE } from "@/lib/check-content/agents-md-guide";
import { distinctSourceLabels } from "@/lib/leaderboard-model-panel";
import { checkSubPath } from "@/lib/utils/check-path";
import { guidePath } from "@/lib/utils/guide-path";
import { REPORT_PATH, REPORT_TITLE, SIZE_REPORT_PATH } from "@/lib/utils/report-path";

import { CodeText } from "./CodeText";
import { CopySnippet } from "./CopySnippet";
import { ExternalLink } from "./ExternalLink";
import { IntentLink } from "./IntentLink";
import { LINK } from "./link-class";
import { Panel, PanelHeading } from "./Panel";

const MORE = [
  { href: checkSubPath("agents_md", "examples"), label: "AGENTS.md examples", note: "every one on the board" },
  { href: checkSubPath("agents_md", "vs-claude-md"), label: "AGENTS.md vs CLAUDE.md", note: "which to use" },
  { href: guidePath("one-file-for-all-agents"), label: "One file for all agents", note: "setup per agent" },
  { href: guidePath("agents-md-monorepo"), label: "AGENTS.md in a monorepo", note: "one per package" },
  { href: SIZE_REPORT_PATH, label: "How long AGENTS.md files are", note: "sizes across the board" },
  { href: REPORT_PATH, label: REPORT_TITLE, note: "over time" },
  { href: "/agents", label: "Which agents read it", note: "per their docs" },
];

const SOURCES = [...new Set(AGENTS_MD_PRACTICES.flatMap((p) => p.sources))];

export function AgentsMdPractices() {
  return (
    <div className="flex flex-col gap-3.5">
      <Panel>
        <PanelHeading>What makes a good AGENTS.md?</PanelHeading>
        <ul className="m-0 ml-5 list-disc text-[14.5px] leading-relaxed text-ink-dim">
          {AGENTS_MD_PRACTICES.map((p) => (
            <li key={p.label}>
              <strong className="text-ink">{p.label}.</strong> <CodeText text={p.text} />
              {p.link && (
                <>
                  {" "}
                  <IntentLink href={p.link.href} className="prose-link">
                    {p.link.label}
                  </IntentLink>
                  .
                </>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-3 mb-0 text-[13px] text-muted">
          From the docs:{" "}
          {distinctSourceLabels(SOURCES).map((label, i) => (
            <span key={SOURCES[i]}>
              {i > 0 && " · "}
              <ExternalLink href={SOURCES[i]} title={SOURCES[i]}>
                {label}
              </ExternalLink>
            </span>
          ))}
        </p>
      </Panel>

      <div className="grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        <Panel className="h-full">
          <PanelHeading>AGENTS.md template</PanelHeading>
          <p className="m-0 mb-2 text-[13.5px] text-ink-dim">
            Replace the commands and rules with your repo&apos;s, and delete any section with nothing true to say.
          </p>
          <CopySnippet text={AGENTS_MD_TEMPLATE} label="AGENTS.md template" />
        </Panel>

        <Panel className="h-full">
          <PanelHeading>More on AGENTS.md</PanelHeading>
          <ul className="link-list">
            {MORE.map((l) => (
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
    </div>
  );
}

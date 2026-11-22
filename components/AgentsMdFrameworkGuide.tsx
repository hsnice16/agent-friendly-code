import type { ExampleLink } from "@/lib/agents-md-example-links";
import type { FrameworkExamples } from "@/lib/agents-md-frameworks";
import type { AgentsMdGuide } from "@/lib/framework-guides/types";
import { distinctSourceLabels } from "@/lib/leaderboard-model-panel";
import { checkPath, checkSubPath, frameworkExamplesPath } from "@/lib/utils/check-path";
import { repoPath } from "@/lib/utils/repo-path";

import { AgentsMdExampleTable } from "./AgentsMdExampleTable";
import { CodeText } from "./CodeText";
import { ExternalLink } from "./ExternalLink";
import { GeneratorCallout } from "./GeneratorCallout";
import { IntentLink } from "./IntentLink";
import { LINK } from "./link-class";
import { Panel, PanelHeading } from "./Panel";

const LIST = "m-0 ml-5 list-disc text-[14.5px] leading-relaxed text-ink-dim";

export function AgentsMdFrameworkGuide({
  framework,
  others,
  languages = [],
}: {
  framework: FrameworkExamples;
  others: { slug: string; label: string }[];
  /** Example pages for the languages its apps are written in. */
  languages?: ExampleLink[];
}) {
  const { guide, rows, passing, own } = framework;

  return (
    <>
      <AgentsMdGuidePanels guide={guide} />

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>
            {guide.label} repos with an AGENTS.md or CLAUDE.md ({rows.length})
          </PanelHeading>
          <p className="m-0 mb-3 text-[14px] text-ink-dim">
            Built on {guide.label}; {passing} pass the{" "}
            <IntentLink href={checkPath("agents_md")} className="prose-link">
              AGENTS.md check
            </IntentLink>{" "}
            in full.
            {own && (
              <>
                {" "}
                <IntentLink href={repoPath(own)} className="prose-link">
                  {own.owner}/{own.name}
                </IntentLink>{" "}
                has one too, for contributors to {guide.label} itself.
              </>
            )}
          </p>
          <AgentsMdExampleTable rows={rows} caption={`${guide.label} repos with an AGENTS.md or CLAUDE.md`} />
        </Panel>
      </div>

      <div className="mt-3.5">
        <GeneratorCallout page="framework" />
      </div>

      {languages.length > 0 && (
        <p className="mt-5 mb-0 text-[13px] text-muted">
          By language:{" "}
          {languages.map((l, i) => (
            <span key={l.href}>
              {i > 0 && " · "}
              <IntentLink href={l.href} className={LINK}>
                {l.label} AGENTS.md examples
              </IntentLink>
            </span>
          ))}
        </p>
      )}

      <p className={`${languages.length > 0 ? "mt-2" : "mt-5"} mb-0 text-[13px] text-muted`}>
        More examples:{" "}
        {others.map((o) => (
          <span key={o.slug}>
            <IntentLink href={frameworkExamplesPath(o.slug)} className={LINK}>
              {o.label}
            </IntentLink>
            {" · "}
          </span>
        ))}
        <IntentLink href={checkSubPath("agents_md", "examples")} className={LINK}>
          all examples
        </IntentLink>
      </p>
    </>
  );
}

/** The guidance itself, shared by the framework and language pages. */
export function AgentsMdGuidePanels({ guide }: { guide: AgentsMdGuide }) {
  return (
    <>
      <Panel>
        <PanelHeading>Which commands should it list?</PanelHeading>
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[14.5px] text-ink-dim">
          {guide.commands.map((c) => (
            <li key={c.cmd} className="flex flex-col gap-x-4 md:flex-row md:items-baseline">
              <code className="shrink-0 font-mono text-[13px] text-ink md:w-[22rem]">{c.cmd}</code>
              <span>
                <CodeText text={c.note} />
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 mb-0 text-[13px] text-muted">
          Write them as your repo runs them, with its package manager and flags, plus how to run one test.
        </p>
      </Panel>

      <div className="mt-3.5 grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        <Panel className="h-full">
          <PanelHeading>What layout should it explain?</PanelHeading>
          <ul className={LIST}>
            {guide.layout.map((l) => (
              <li key={l}>
                <CodeText text={l} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="h-full">
          <PanelHeading>What do agents get wrong?</PanelHeading>
          <ul className={LIST}>
            {guide.rules.map((r) => (
              <li key={r}>
                <CodeText text={r} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <p className="mt-3 mb-0 text-[13px] text-muted">
        From the official docs:{" "}
        {distinctSourceLabels(guide.sources).map((label, i) => (
          <span key={guide.sources[i]}>
            {i > 0 && " · "}
            <ExternalLink href={guide.sources[i]} title={guide.sources[i]}>
              {label}
            </ExternalLink>
          </span>
        ))}
        . The rest of the file is the same for any project:{" "}
        <IntentLink href={checkPath("agents_md")} className="prose-link">
          what goes in an AGENTS.md
        </IntentLink>
        .
      </p>
    </>
  );
}

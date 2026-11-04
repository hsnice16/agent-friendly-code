import Link from "next/link";

import type { FrameworkExamples } from "@/lib/agents-md-frameworks";
import type { AgentsMdGuide } from "@/lib/framework-guides/types";
import { distinctSourceLabels } from "@/lib/leaderboard-model-panel";
import { checkPath, checkSubPath, frameworkExamplesPath } from "@/lib/utils/check-path";
import { repoPath } from "@/lib/utils/repo-path";

import { AgentsMdExampleTable } from "./AgentsMdExampleTable";
import { CodeText } from "./CodeText";
import { ExternalLink } from "./ExternalLink";
import { LINK } from "./link-class";
import { Panel, PanelHeading } from "./Panel";

const LIST = "m-0 ml-5 list-disc text-[14.5px] leading-relaxed text-ink-dim";

export function AgentsMdFrameworkGuide({
  framework,
  others,
}: {
  framework: FrameworkExamples;
  others: { slug: string; label: string }[];
}) {
  const { guide, rows, passing, own } = framework;

  return (
    <>
      <section className="mb-7">
        <h1 className="mb-2.5 text-[28px] font-bold leading-[1.18] tracking-tight">
          What to put in an AGENTS.md for {guide.label}
        </h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] leading-relaxed text-ink">
          <CodeText text={guide.intro} />
        </p>
      </section>

      <AgentsMdGuidePanels guide={guide} />

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>
            {guide.label} repos with an AGENTS.md or CLAUDE.md ({rows.length})
          </PanelHeading>
          <p className="m-0 mb-3 text-[14px] text-ink-dim">
            Built on {guide.label}; {passing} pass the{" "}
            <Link href={checkPath("agents_md")} className="prose-link">
              AGENTS.md check
            </Link>{" "}
            in full.
            {own && (
              <>
                {" "}
                <Link href={repoPath(own)} className="prose-link">
                  {own.owner}/{own.name}
                </Link>{" "}
                has one too, for contributors to {guide.label} itself.
              </>
            )}
          </p>
          <AgentsMdExampleTable rows={rows} caption={`${guide.label} repos with an AGENTS.md or CLAUDE.md`} />
        </Panel>
      </div>

      <p className="mt-5 mb-0 text-[13px] text-muted">
        More examples:{" "}
        {others.map((o) => (
          <span key={o.slug}>
            <Link href={frameworkExamplesPath(o.slug)} className={LINK}>
              {o.label}
            </Link>
            {" · "}
          </span>
        ))}
        <Link href={checkSubPath("agents_md", "examples")} className={LINK}>
          all examples
        </Link>
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
            <li key={c.cmd} className="flex flex-col gap-x-4 sm:flex-row sm:items-baseline">
              <code className="shrink-0 font-mono text-[13px] text-ink sm:w-[22rem]">{c.cmd}</code>
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
        <Link href={checkPath("agents_md")} className="prose-link">
          what goes in an AGENTS.md
        </Link>
        .
      </p>
    </>
  );
}

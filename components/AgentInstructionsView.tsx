"use client";

import { Fragment, type ReactNode } from "react";

import type { AgentFileShare } from "@/lib/utils/agent-instructions";
import { GENERATOR_PATH, STARTER_ID } from "@/lib/utils/generator-path";
import { SIZE_REPORT_PATH } from "@/lib/utils/report-path";

import { CopySnippet } from "./CopySnippet";
import { InfoRow } from "./InfoRow";
import { IntentLink } from "./IntentLink";
import { Panel, PanelHeading } from "./Panel";

/** An agent file with its link on the host resolved; null when the default branch is unknown. */
type LinkedFile = { name: string; href: string | null; note: string | null };

export type Props = {
  slug: string;
  /** `longerThan`: the percent of the board's measured files that are shorter. */
  main: (LinkedFile & { state: "ok" | "thin" | "empty"; longerThan?: number }) | null;
  absentMain: string[];
  others: LinkedFile[];
  absentOthers: string[];
  share: AgentFileShare;
  examplesHref: string;
  examples: { href: string; label: string }[];
  /** A starter AGENTS.md, for a repo without a usable one. */
  starter?: string | null;
  /** Server-rendered per-agent stubs; without them the starter links to the generator. */
  companions?: ReactNode;
};

function FileName({ file }: { file: LinkedFile }) {
  const code = <code className="font-mono text-[13px] text-ink">{file.name}</code>;
  if (!file.href) return code;
  return (
    <a href={file.href} target="_blank" rel="nofollow noopener noreferrer" className="ink-link">
      {code}
      <span className="sr-only"> (new tab)</span>
    </a>
  );
}

function orList(names: string[]): string {
  return names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} or ${names[names.length - 1]}`;
}

function Mark({ ok }: { ok: boolean }) {
  return (
    <span aria-hidden="true" className={`mr-1.5 font-semibold ${ok ? "text-ok" : "text-bad"}`}>
      {ok ? "✓" : "✗"}
    </span>
  );
}

function MainFile({ main, absentMain }: Pick<Props, "main" | "absentMain">) {
  if (!main) {
    return (
      <>
        <Mark ok={false} />
        None at the root (no {orList(absentMain)})
      </>
    );
  }

  const file = <FileName file={main} />;
  if (main.state === "empty") {
    return (
      <>
        <Mark ok={false} />
        {file} is there, but empty
      </>
    );
  }
  return (
    <>
      <Mark ok />
      {file}
      {main.note && <span className="text-muted"> · {main.note}</span>}
      {main.longerThan != null && (
        <>
          <span className="text-muted"> · </span>
          <IntentLink href={SIZE_REPORT_PATH} className="dim-link">
            longer than {main.longerThan}% on the board
          </IntentLink>
        </>
      )}
      {main.state === "thin" && <span className="text-muted"> · short</span>}
    </>
  );
}

function OtherFiles({ others, absentOthers }: Pick<Props, "others" | "absentOthers">) {
  return (
    <>
      {others.length > 0 && (
        <span className="mr-3 inline-block max-w-full [overflow-wrap:anywhere]">
          <Mark ok />
          {others.map((f, i) => (
            <Fragment key={f.name}>
              {i > 0 && ", "}
              <FileName file={f} />
              {f.note && <span className="text-muted"> ({f.note})</span>}
            </Fragment>
          ))}
        </span>
      )}
      {absentOthers.length > 0 && (
        <span className="inline-block text-muted">
          {others.length > 0 ? "No " : "None: no "}
          {orList(absentOthers)}
        </span>
      )}
    </>
  );
}

function HowCommon({ share, examplesHref }: Pick<Props, "share" | "examplesHref">) {
  const { has, total, language } = share;
  return (
    <>
      {language && (
        <>
          {language.has} of {language.total} {language.label} repos
          <span className="text-muted"> · </span>
        </>
      )}
      {has} of {total} repos on the leaderboard
      <span className="text-muted"> · </span>
      <IntentLink href={examplesHref} className="arrow-link">
        See examples →
      </IntentLink>
    </>
  );
}

export function AgentInstructionsView({
  slug,
  main,
  absentMain,
  others,
  absentOthers,
  share,
  examplesHref,
  examples,
  starter,
  companions,
}: Props) {
  return (
    <Panel>
      <PanelHeading>
        Does <span className="normal-case">{slug}</span> have agent instructions?
      </PanelHeading>
      <p className="m-0 mb-1 max-w-[75ch] text-[14px] leading-relaxed text-muted">
        An AGENTS.md (or CLAUDE.md) at the root tells AI coding agents how to build, test and work in the repo. A few
        agents also read a file of their own.
      </p>
      <dl className="m-0">
        <InfoRow label="AGENTS.md / CLAUDE.md">
          <MainFile main={main} absentMain={absentMain} />
        </InfoRow>
        <InfoRow label="Agent-specific files">
          <OtherFiles others={others} absentOthers={absentOthers} />
        </InfoRow>
        <InfoRow label="Repos that have one">
          <HowCommon share={share} examplesHref={examplesHref} />
        </InfoRow>
        {examples.length > 0 && (
          <InfoRow label="Examples to copy">
            {examples.map((e, i) => (
              <Fragment key={e.href}>
                {i > 0 && <span className="text-muted"> · </span>}
                <IntentLink href={e.href} className="ink-link">
                  {e.label}
                </IntentLink>
              </Fragment>
            ))}
          </InfoRow>
        )}
      </dl>
      {starter && (
        <details id={STARTER_ID} className="scroll-mt-20">
          {/* Padding, not flex, for the 44px tap target: a flex summary loses its disclosure marker. */}
          <summary className="cursor-pointer py-2.5 text-[13px] font-medium ink-link">Get a starter AGENTS.md</summary>
          <p className="m-0 mb-2 text-[13px] text-muted">
            From the files the checks found. Fill in the commands, then commit it at the root.
          </p>
          <CopySnippet wrap text={starter} event={{ name: "copy_install", tool: "starter_agents_md" }} />
          {companions ? (
            <>
              <p className="mt-4 mb-2 text-[13px] font-medium text-ink">Beside it, per agent</p>
              {companions}
            </>
          ) : (
            <p className="mt-3 mb-0 text-[13px]">
              <IntentLink href={GENERATOR_PATH} className="prose-link">
                What to add beside it for Claude Code, Gemini CLI and others
              </IntentLink>
            </p>
          )}
        </details>
      )}
    </Panel>
  );
}

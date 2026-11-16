import Link from "next/link";
import { Fragment } from "react";

import type { AgentFile, AgentInstructionsData } from "@/lib/utils/agent-instructions";
import { checkSubPath } from "@/lib/utils/check-path";
import { GENERATOR_PATH } from "@/lib/utils/generator-path";
import { repoFileUrl } from "@/lib/utils/repo-file-url";

import { CompanionFiles } from "./CompanionFiles";
import { CopySnippet } from "./CopySnippet";
import { Panel, PanelHeading } from "./Panel";

type RepoLocation = Parameters<typeof repoFileUrl>[0];

function FileName({ file, repo }: { file: AgentFile; repo: RepoLocation }) {
  const href = repoFileUrl(repo, file.path, file.directory);
  const code = <code className="font-mono text-[13px] text-ink">{file.name}</code>;
  if (!href) return code;
  return (
    <a href={href} target="_blank" rel="nofollow noopener noreferrer" className="ink-link">
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="info-row">
      <dt className="text-[13px] font-medium text-muted">{label}</dt>
      <dd className="m-0 break-words text-[14.5px] text-ink-dim">{children}</dd>
    </div>
  );
}

function MainFile({ data, repo }: { data: AgentInstructionsData; repo: RepoLocation }) {
  const { main } = data;
  if (!main) {
    return (
      <>
        <Mark ok={false} />
        None at the root (no {orList(data.absentMain)})
      </>
    );
  }

  const file = <FileName file={main} repo={repo} />;
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
      {main.state === "thin" && <span className="text-muted"> · short</span>}
    </>
  );
}

function OtherFiles({ data, repo }: { data: AgentInstructionsData; repo: RepoLocation }) {
  const { others, absentOthers } = data;
  return (
    <>
      {others.length > 0 && (
        <span className="mr-3 inline-block max-w-full [overflow-wrap:anywhere]">
          <Mark ok />
          {others.map((f, i) => (
            <Fragment key={f.path}>
              {i > 0 && ", "}
              <FileName file={f} repo={repo} />
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

function HowCommon({ data }: { data: AgentInstructionsData }) {
  const { has, total, language } = data.share;
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
      <Link href={checkSubPath("agents_md", "examples")} className="arrow-link">
        See examples →
      </Link>
    </>
  );
}

/** The agent-file checks read as one answer; "All checks" keeps the per-check detail. */
export function AgentInstructions({
  data,
  slug,
  repo,
  starter,
  companions = false,
}: {
  data: AgentInstructionsData;
  slug: string;
  repo: RepoLocation;
  /** A starter AGENTS.md, for a repo without a usable one. */
  starter?: string | null;
  /** Off on repo pages: crawlers read all of them, and the stubs are the same on each, so they link to one copy. */
  companions?: boolean;
}) {
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
        <Row label="AGENTS.md / CLAUDE.md">
          <MainFile data={data} repo={repo} />
        </Row>
        <Row label="Agent-specific files">
          <OtherFiles data={data} repo={repo} />
        </Row>
        <Row label="Repos that have one">
          <HowCommon data={data} />
        </Row>
      </dl>
      {starter && (
        <details>
          {/* Padding, not flex, for the 44px tap target: a flex summary loses its disclosure marker. */}
          <summary className="cursor-pointer py-2.5 text-[13px] font-medium ink-link">Get a starter AGENTS.md</summary>
          <p className="m-0 mb-2 text-[13px] text-muted">
            From the files the checks found. Fill in the commands, then commit it at the root.
          </p>
          <CopySnippet wrap text={starter} event={{ name: "copy_install", tool: "starter_agents_md" }} />
          {companions ? (
            <>
              <p className="mt-4 mb-2 text-[13px] font-medium text-ink">Beside it, per agent</p>
              <CompanionFiles />
            </>
          ) : (
            <p className="mt-3 mb-0 text-[13px]">
              <Link href={GENERATOR_PATH} prefetch={false} className="prose-link">
                What to add beside it for Claude Code, Gemini CLI and others
              </Link>
            </p>
          )}
        </details>
      )}
    </Panel>
  );
}

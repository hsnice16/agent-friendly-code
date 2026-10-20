import Link from "next/link";
import { Fragment } from "react";

import type { AgentFile, AgentInstructionsData } from "@/lib/utils/agent-instructions";
import { checkSubPath } from "@/lib/utils/check-path";
import { repoFileUrl } from "@/lib/utils/repo-file-url";

import { Panel, PanelHeading } from "./Panel";

type RepoLocation = Parameters<typeof repoFileUrl>[0];

function FileName({ file, repo }: { file: AgentFile; repo: RepoLocation }) {
  const href = repoFileUrl(repo, file.path, file.directory);
  const code = <code className="font-mono text-[13px] text-ink">{file.name}</code>;
  if (!href) return code;
  return (
    <a href={href} target="_blank" rel="nofollow noopener noreferrer">
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
    <div className="grid grid-cols-1 gap-1 border-b border-line py-3 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
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
        <span className="mr-3 inline-block">
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
      <Link href={checkSubPath("agents_md", "examples")} className="text-ink-dim hover:text-ink-soft">
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
}: {
  data: AgentInstructionsData;
  slug: string;
  repo: RepoLocation;
}) {
  return (
    <Panel>
      <PanelHeading>Does {slug} have agent instructions?</PanelHeading>
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
    </Panel>
  );
}

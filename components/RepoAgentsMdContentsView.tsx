"use client";

import type { RepoAgentsMdContents } from "@/lib/repo-agents-md-contents";

import { InfoRow } from "./InfoRow";
import { IntentLink } from "./IntentLink";
import { Panel, PanelHeading } from "./Panel";

const CODE = "font-mono text-[13px] text-ink";

// Client: see AGENTS.md → Conventions.
export function RepoAgentsMdContentsView({ contents: c }: { contents: RepoAgentsMdContents }) {
  return (
    <Panel>
      <PanelHeading>
        What its <span className="normal-case">{c.file}</span> covers
      </PanelHeading>
      <dl className="m-0">
        <InfoRow label="Sections on">{c.covered.length > 0 ? c.covered.join(", ") : "None we recognise"}</InfoRow>
        {c.missing.length > 0 && (
          <InfoRow label="No section on">
            {c.missing.map((m, i) => (
              <span key={m.label}>
                {i > 0 && ", "}
                {m.label} <span className="text-muted">({m.share} of files have one)</span>
              </span>
            ))}
          </InfoRow>
        )}
        <InfoRow label="Tests">{c.test}</InfoRow>
        <InfoRow label="Points to">{c.points}</InfoRow>
        <InfoRow label="Rules">{c.rules}</InfoRow>
      </dl>
      <p className="mt-3 mb-0 text-[13px] text-muted">
        Read <time dateTime={c.read.iso}>{c.read.text}</time>
        {c.commit && (
          <>
            {" "}
            at <code className={CODE}>{c.commit}</code>
          </>
        )}
        , against {c.files} files on the board.{" "}
        <IntentLink href={c.reportHref} className="dim-link">
          What&apos;s in an AGENTS.md
        </IntentLink>
      </p>
    </Panel>
  );
}

import Link from "next/link";

import type { BestExample } from "@/lib/agents-md-examples-best";
import { compactStars, formatDate, hostLabel } from "@/lib/utils/format";
import { repoPath } from "@/lib/utils/repo-path";

import { CopySnippet } from "./CopySnippet";
import { ExternalLink } from "./ExternalLink";
import { LINK } from "./link-class";
import { Panel, PanelHeading } from "./Panel";

export function BestAgentsMdExample({ best, language }: { best: BestExample; language: string }) {
  const { row, rawUrl, notes } = best;
  const out = row.file.split("/").pop() ?? row.file;

  return (
    <Panel tone="tip">
      <PanelHeading tone="tip" icon="file-text">
        A real {language} {row.file} to start from
      </PanelHeading>
      <p className="m-0 mb-3 text-[14.5px] leading-relaxed text-ink-dim">
        <Link href={repoPath(row)} className={LINK}>
          {row.owner}/{row.name}
        </Link>{" "}
        <span className="text-muted">
          ({compactStars(row.stars)}, scores {Math.round(row.score ?? 0)})
        </span>
        :{" "}
        {row.fileUrl ? (
          <ExternalLink href={row.fileUrl} tone="ink">
            read {row.file} on {hostLabel(row.host)}
          </ExternalLink>
        ) : (
          row.file
        )}
        , {(row.length ?? 0).toLocaleString("en")} characters
        {row.last_scored_at != null && <>, checked {formatDate(row.last_scored_at)}</>}. Copy it into your repo, then
        swap its commands and paths for yours:
      </p>
      <CopySnippet
        text={`curl -fsSL ${rawUrl} -o ${out}`}
        highlight="tip"
        event={{ name: "copy_install", tool: "example_agents_md" }}
      />
      {notes.length > 0 && (
        <ul className="m-0 mt-3 ml-5 list-disc text-[14px] leading-relaxed text-ink-dim">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
      <p className="m-0 mt-3 text-[12.5px] text-muted">
        Picked as the highest-scoring {language} repo with a 1.5–16 KiB file, among the better-starred half.
      </p>
    </Panel>
  );
}

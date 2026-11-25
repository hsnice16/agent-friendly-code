"use client";

import { MODEL_LABEL } from "@/lib/model-labels";
import type { ModelId } from "@/lib/scoring/weights";
import { modelPath } from "@/lib/utils/leaderboard-href";

import { CodeText } from "./CodeText";
import { ExternalLink } from "./ExternalLink";
import { IntentLink } from "./IntentLink";
import { LINK } from "./link-class";

export type AgentReadsRow = {
  id: ModelId;
  files: string[];
  note: string;
  /** [url, label]: labels are resolved on the server, where `sourceLabel` lives beside MODELS. */
  sources: [string, string][];
};

// Client: see AGENTS.md → Conventions.
export function AgentReadsView({ rows }: { rows: AgentReadsRow[] }) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region
    <section className="table-wrap" tabIndex={0} aria-label="Files each agent reads">
      <table className="data-table min-w-[620px] text-[14px]">
        <caption className="sr-only">Repo files each AI coding agent reads</caption>
        <thead>
          <tr>
            <th scope="col">Agent</th>
            <th scope="col">Reads from the repo</th>
            <th scope="col">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="align-top">
              <th scope="row" className="font-medium">
                <IntentLink href={modelPath(r.id)} className={`${LINK} cover-link`}>
                  {MODEL_LABEL[r.id]}
                </IntentLink>
              </th>
              <td>
                <ul className="m-0 list-none p-0">
                  {r.files.map((f) => (
                    <li key={f}>
                      <code className="font-mono text-[13px] text-ink">{f}</code>
                    </li>
                  ))}
                </ul>
              </td>
              <td className="text-ink-dim">
                <CodeText text={r.note} />{" "}
                {r.sources.map(([url, label]) => (
                  <span key={url} className="mr-2 text-[12.5px]">
                    <ExternalLink href={url} title={url}>
                      {label}
                    </ExternalLink>
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

import type { OtherTool } from "@/lib/agent-reads";
import { distinctSourceLabels } from "@/lib/leaderboard-model-panel";

import { ExternalLink } from "./ExternalLink";
import { Panel, PanelHeading } from "./Panel";

const CODE = "font-mono text-[13px] text-ink";

export function OtherToolsTable({ tools }: { tools: OtherTool[] }) {
  return (
    <Panel>
      <PanelHeading>Other tools, not on our board</PanelHeading>
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region */}
      <section className="table-wrap" tabIndex={0} aria-label="Files other AI coding tools read">
        <table className="data-table min-w-[720px] text-[14px]">
          <caption className="sr-only">Repo files AI coding tools we don&apos;t score read, per their docs</caption>
          <thead>
            <tr>
              <th scope="col">Tool</th>
              <th scope="col">Reads from the repo</th>
              <th scope="col">AGENTS.md?</th>
              <th scope="col">Docs</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((t) => (
              <tr key={t.name} className="align-top">
                <th scope="row" className="font-medium">
                  {t.name}
                </th>
                <td>
                  <ul className="m-0 list-none p-0">
                    {t.files.map((f) => (
                      <li key={f}>
                        <code className={CODE}>{f}</code>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="text-ink-dim">{t.agentsMd}</td>
                <td className="min-w-[11rem] text-[12.5px] [overflow-wrap:anywhere]">
                  <ul className="m-0 list-none p-0">
                    {distinctSourceLabels(t.sources).map((label, i) => (
                      <li key={t.sources[i]}>
                        <ExternalLink href={t.sources[i]} title={t.sources[i]}>
                          {label}
                        </ExternalLink>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Panel>
  );
}

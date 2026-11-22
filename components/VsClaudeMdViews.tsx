"use client";

import { CodeText } from "./CodeText";
import { CopySnippet } from "./CopySnippet";
import { IntentLink } from "./IntentLink";
import { LINK } from "./link-class";

// Client: see AGENTS.md → Conventions.

export type ReadsRow = { key: string; label: string; href?: string; agentsMd: string; claudeMd: boolean };

export function ReadsTableView({ rows }: { rows: ReadsRow[] }) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region
    <section className="table-wrap" tabIndex={0} aria-label="Agents and the files they read">
      <table className="data-table text-[14px]">
        <caption className="sr-only">Whether each AI coding agent reads AGENTS.md and CLAUDE.md</caption>
        <thead>
          <tr>
            <th scope="col">Agent</th>
            <th scope="col">
              <span className="normal-case">AGENTS.md</span>
            </th>
            <th scope="col">
              <span className="normal-case">CLAUDE.md</span>
            </th>
          </tr>
        </thead>
        <tbody className="text-ink-dim">
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row" className="font-medium">
                {r.href ? (
                  <IntentLink href={r.href} className={`${LINK} cover-link`}>
                    {r.label}
                  </IntentLink>
                ) : (
                  r.label
                )}
              </th>
              <td>{r.agentsMd}</td>
              <td>{r.claudeMd ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export type SetupCard = {
  id: string;
  name: string;
  note: string;
  caption?: string;
  snippet?: string;
  count: number;
  examples: { label: string; href: string }[];
};

export function SetupsView({ setups, check }: { setups: SetupCard[]; check: string }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {setups.map((s) => (
          <div key={s.id} className="min-w-0">
            <h3 className="m-0 text-[14.5px] font-semibold text-ink">{s.name}</h3>
            <p className="m-0 mt-1 text-[14px] leading-relaxed text-ink-dim">
              <CodeText text={s.note} />
            </p>
            {s.snippet && (
              <div className="mt-2">
                <p className="m-0 mb-1.5 font-mono text-[12.5px] text-muted">{s.caption}</p>
                <CopySnippet text={s.snippet} label={s.caption} />
              </div>
            )}
            <p className="m-0 mt-2 text-[13px] text-muted">
              {s.count} repos, including{" "}
              {s.examples.map((e, i) => (
                <span key={e.href}>
                  {i > 0 && ", "}
                  <IntentLink href={e.href} className="dim-link">
                    {e.label}
                  </IntentLink>
                </span>
              ))}
              .
            </p>
          </div>
        ))}
      </div>
      <p className="m-0 mt-4 mb-1.5 font-mono text-[12.5px] text-muted">Which setup does a repo use?</p>
      <CopySnippet text={check} label="Check AGENTS.md and CLAUDE.md" />
    </>
  );
}

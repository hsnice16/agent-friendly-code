"use client";

import type { Stance } from "@/lib/ai-policy";
import { repoPath } from "@/lib/utils/repo-path";

import { IntentLink } from "./IntentLink";
import { STANCE_CHIP } from "./stance-chip";

// Labels and meanings arrive as props: lib/ai-policy.ts carries the whole policy dataset,
// which must not ship to the browser.

export type PolicyGroup = {
  stance: Stance;
  label: string;
  meaning: string;
  anchor: string;
  rows: {
    key: string;
    host: string;
    owner: string;
    name: string;
    onBoard: boolean;
    summary: string;
    url: string;
    path: string;
  }[];
};

function Chip({ stance, label }: { stance: Stance; label: string }) {
  return <span className={`chip eyebrow whitespace-nowrap ${STANCE_CHIP[stance]}`}>{label}</span>;
}

export function AiPolicyTableView({ groups }: { groups: PolicyGroup[] }) {
  return (
    <div className="flex flex-col gap-6">
      {groups.map((g) => (
        <section key={g.stance} id={g.anchor} className="scroll-mt-24">
          <h3 className="m-0 mb-1 flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Chip stance={g.stance} label={g.label} />
            <span className="tabular-nums text-muted">{g.rows.length} repos</span>
          </h3>
          <p className="m-0 mb-2.5 text-[13.5px] text-ink-dim">{g.meaning}</p>
          {/* biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region */}
          <section className="table-wrap" tabIndex={0} aria-label={`${g.label} policies`}>
            <table className="data-table text-[14px]">
              <caption className="sr-only">{`Repos whose AI policy: ${g.meaning}`}</caption>
              <thead>
                <tr>
                  <th scope="col">Repo</th>
                  <th scope="col" className="wide-only">
                    Stance
                  </th>
                  <th scope="col">What it says</th>
                  <th scope="col">Policy</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map((p) => (
                  <tr key={p.key}>
                    <th scope="row" className="font-normal repo-cell">
                      {p.onBoard ? (
                        <IntentLink href={repoPath(p)} className="font-medium ink-link cover-link">
                          {p.owner}/<wbr />
                          {p.name}
                        </IntentLink>
                      ) : (
                        <span className="font-medium text-ink">
                          {p.owner}/<wbr />
                          {p.name}
                        </span>
                      )}
                    </th>
                    <td className="wide-only">
                      <Chip stance={g.stance} label={g.label} />
                    </td>
                    <td className="min-w-[12rem] text-ink-dim">{p.summary}</td>
                    <td className="mono-cell [overflow-wrap:anywhere]">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        aria-label={`${p.path} in ${p.owner}/${p.name} (new tab)`}
                        className="out-link dim-link"
                      >
                        {p.path} <span aria-hidden="true" className="icon-out" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </section>
      ))}
    </div>
  );
}

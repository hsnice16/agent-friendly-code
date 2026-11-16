import Link from "next/link";

import {
  type AiPolicy,
  groupByStance,
  repoKey,
  STANCE_LABEL,
  STANCE_MEANING,
  type Stance,
  stanceAnchor,
} from "@/lib/ai-policy";
import { repoPath } from "@/lib/utils/repo-path";

const STANCE_CHIP: Record<Stance, string> = {
  bans: "border-bad/40 bg-bad/10 text-bad",
  restricts: "border-warn/40 bg-warn/10 text-warn",
  // No tint: text-info on bg-info/10 is 4.3:1 in light mode, under AA for text this small.
  disclose: "border-info/40 text-info",
  allows: "border-line bg-surface-2 text-muted",
  welcomes: "border-ok/40 bg-ok/10 text-ok",
};

export function StanceChip({ stance }: { stance: Stance }) {
  return <span className={`chip eyebrow whitespace-nowrap ${STANCE_CHIP[stance]}`}>{STANCE_LABEL[stance]}</span>;
}

// Grouped rather than filtered so every stance has an anchor the breakdown links to, with no client script.
export function AiPolicyTable({ policies, onBoard }: { policies: AiPolicy[]; onBoard: Set<string> }) {
  return (
    <div className="flex flex-col gap-6">
      {groupByStance(policies).map((g) => (
        <section key={g.stance} id={stanceAnchor(g.stance)} className="scroll-mt-24">
          <h3 className="m-0 mb-1 flex items-center gap-2 text-[15px] font-semibold text-ink">
            <StanceChip stance={g.stance} />
            <span className="tabular-nums text-muted">{g.policies.length} repos</span>
          </h3>
          <p className="m-0 mb-2.5 text-[13.5px] text-ink-dim">{STANCE_MEANING[g.stance]}</p>
          {/* biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region */}
          <section className="table-wrap" tabIndex={0} aria-label={`${STANCE_LABEL[g.stance]} policies`}>
            <table className="data-table text-[14px]">
              <caption className="sr-only">{`Repos whose AI policy: ${STANCE_MEANING[g.stance]}`}</caption>
              <thead>
                <tr>
                  <th scope="col">Repo</th>
                  <th scope="col" className="hidden sm:table-cell">
                    Stance
                  </th>
                  <th scope="col">What it says</th>
                  <th scope="col">Policy</th>
                </tr>
              </thead>
              <tbody>
                {g.policies.map((p) => (
                  <tr key={repoKey(p)}>
                    <th scope="row" className="font-normal repo-cell">
                      {onBoard.has(repoKey(p)) ? (
                        // ~120 rows: scrolling past them would prefetch each repo page, a billed ISR read apiece.
                        <Link href={repoPath(p)} prefetch={false} className="font-medium ink-link cover-link">
                          {p.owner}/<wbr />
                          {p.name}
                        </Link>
                      ) : (
                        <span className="font-medium text-ink">
                          {p.owner}/<wbr />
                          {p.name}
                        </span>
                      )}
                    </th>
                    <td className="hidden sm:table-cell">
                      <StanceChip stance={p.stance} />
                    </td>
                    <td className="min-w-[12rem] text-ink-dim">{p.summary}</td>
                    <td className="font-mono text-[12.5px] [overflow-wrap:anywhere]">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        aria-label={`${p.path} in ${p.owner}/${p.name} (new tab)`}
                        className="inline-flex items-center gap-0.5 dim-link"
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

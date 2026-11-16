import Link from "next/link";

import { type ContributeRow, hasPolicies } from "@/lib/contribute";
import { compactStars } from "@/lib/utils/format";
import { repoPath } from "@/lib/utils/repo-path";

import { ScoreNumber } from "./ScoreNumber";

// On a phone the repo, its score and whether it has an agent file are the pick; the rest is on the repo page.
const WIDE_ONLY = "hidden sm:table-cell";

function Mark({ on, title }: { on: boolean; title?: string }) {
  return on ? (
    <>
      {/* A glyph, not the icon: 200 SVGs, each sent twice (HTML and RSC payload), were a third of the page. */}
      <span aria-hidden="true" className="font-bold text-ok">
        ✓
      </span>
      <span className="sr-only">Yes{title ? `: ${title}` : ""}</span>
    </>
  ) : (
    <>
      <span aria-hidden="true" className="text-muted">
        —
      </span>
      <span className="sr-only">No</span>
    </>
  );
}

export function ContributeTable({
  rows,
  caption,
  showLanguage = true,
}: {
  rows: ContributeRow[];
  caption: string;
  /** Off in a one-language section, where every row would repeat it. */
  showLanguage?: boolean;
}) {
  const policy = hasPolicies(rows);

  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region
    <section className="table-wrap" tabIndex={0} aria-label={caption}>
      <table className="data-table text-[14px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="w-8 text-right">
              #
            </th>
            <th scope="col">Repo</th>
            {showLanguage && (
              <th scope="col" className={WIDE_ONLY}>
                Language
              </th>
            )}
            <th scope="col" className={`text-right ${WIDE_ONLY}`}>
              Stars
            </th>
            <th scope="col" className="text-right">
              Score
            </th>
            <th scope="col" className="text-center">
              Agent file
            </th>
            <th scope="col" className={`text-center ${WIDE_ONLY}`}>
              Dev setup
            </th>
            <th scope="col" className={`text-center ${WIDE_ONLY}`}>
              Pre-commit
            </th>
            {policy && (
              <th scope="col" className={WIDE_ONLY}>
                AI policy
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td className="text-right tabular-nums text-muted">{i + 1}</td>
              <td className="repo-cell">
                {/* A long table: scrolling past it would prefetch each repo page, a billed ISR read apiece. */}
                <Link href={repoPath(r)} prefetch={false} className="font-medium ink-link cover-link">
                  {r.owner}/<wbr />
                  {r.name}
                </Link>
              </td>
              {showLanguage && <td className={`whitespace-nowrap text-ink-dim ${WIDE_ONLY}`}>{r.language ?? "—"}</td>}
              <td className={`whitespace-nowrap text-right tabular-nums text-ink-dim ${WIDE_ONLY}`}>
                {compactStars(r.stars)}
              </td>
              <td className="text-right">
                <ScoreNumber score={r.score ?? 0} size="sm" />
              </td>
              <td className="text-center" title={r.agentFile ?? undefined}>
                <Mark on={r.agentFile != null} title={r.agentFile ?? undefined} />
              </td>
              <td className={`text-center ${WIDE_ONLY}`}>
                <Mark on={r.devSetup} />
              </td>
              <td className={`text-center ${WIDE_ONLY}`}>
                <Mark on={r.preCommit} />
              </td>
              {policy && (
                <td className={`text-ink-dim ${WIDE_ONLY}`}>
                  {r.policy?.url ? (
                    <a href={r.policy.url} target="_blank" rel="nofollow noopener noreferrer" className="prose-link">
                      {r.policy.label}
                    </a>
                  ) : (
                    (r.policy?.label ?? (r.host === "github" ? "none found" : "not scanned"))
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

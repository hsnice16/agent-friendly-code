import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import type { ExampleRow } from "@/lib/agents-md-examples";
import { compactStars } from "@/lib/utils/format";
import { repoPath } from "@/lib/utils/repo-path";

import { OwnRepoTag } from "./OwnRepoTag";
import { ScoreNumber } from "./ScoreNumber";

// On a phone the file link and its length are the point; the rest is on the repo page.
const WIDE_ONLY = "hidden sm:table-cell";

export function AgentsMdExampleTable({
  rows,
  caption,
  showLanguage = true,
}: {
  rows: ExampleRow[];
  caption: string;
  /** Off on a one-language page, where every row would repeat it. */
  showLanguage?: boolean;
}) {
  return (
    <div className="table-wrap">
      <table className="data-table text-[14px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Repo</th>
            <th scope="col">File</th>
            <th scope="col" className="text-right">
              Length
            </th>
            <th scope="col" className={`text-right ${WIDE_ONLY}`}>
              Stars
            </th>
            {showLanguage && (
              <th scope="col" className={WIDE_ONLY}>
                Language
              </th>
            )}
            <th scope="col" className={`text-right ${WIDE_ONLY}`}>
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="[overflow-wrap:anywhere] sm:min-w-[9rem]">
                <Link href={repoPath(r)} className="font-medium ink-link">
                  {r.owner}/{r.name}
                </Link>
                <OwnRepoTag repo={r} />
              </td>
              <td className="whitespace-nowrap font-mono text-[12.5px]">
                {r.fileUrl ? (
                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    aria-label={`${r.file} in ${r.owner}/${r.name} (new tab)`}
                    className="inline-flex items-center gap-0.5 text-ink-dim hover:text-ink-soft"
                  >
                    {r.file} <ArrowUpRight size={11} weight="bold" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="text-ink-dim">{r.file}</span>
                )}
              </td>
              <td className="whitespace-nowrap text-right tabular-nums text-ink-dim">
                {r.length != null ? (
                  <>
                    {r.length.toLocaleString("en-US")}
                    <span className="hidden sm:inline"> chars</span>
                  </>
                ) : (
                  "—"
                )}
              </td>
              <td className={`whitespace-nowrap text-right tabular-nums text-ink-dim ${WIDE_ONLY}`}>
                {compactStars(r.stars)}
              </td>
              {showLanguage && <td className={`whitespace-nowrap text-ink-dim ${WIDE_ONLY}`}>{r.language ?? "—"}</td>}
              <td className={`text-right ${WIDE_ONLY}`}>
                <ScoreNumber score={r.score ?? 0} size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

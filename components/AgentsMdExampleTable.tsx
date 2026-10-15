import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import type { ExampleRow } from "@/lib/agents-md-examples";
import { compactStars } from "@/lib/utils/format";
import { repoPath } from "@/lib/utils/repo-path";

import { OwnRepoTag } from "./OwnRepoTag";
import { ScoreNumber } from "./ScoreNumber";

const TH =
  "[&>th]:border-b [&>th]:border-line [&>th]:px-3 [&>th]:py-2.5 [&>th]:text-[11.5px] [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-[0.08em] [&>th]:text-muted";
// On a phone the file link and its length are the point; the rest is on the repo page.
const WIDE_ONLY = "hidden sm:table-cell";
const TD = "[&>td]:border-b [&>td]:border-line [&>td]:px-3 [&>td]:py-2.5 last:[&>td]:border-b-0";

export function AgentsMdExampleTable({ rows, caption }: { rows: ExampleRow[]; caption: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-separate border-spacing-0 text-[14px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className={`bg-surface-2 text-left ${TH}`}>
            <th scope="col">Repo</th>
            <th scope="col">File</th>
            <th scope="col" className="text-right">
              Length
            </th>
            <th scope="col" className={`text-right ${WIDE_ONLY}`}>
              Stars
            </th>
            <th scope="col" className={WIDE_ONLY}>
              Language
            </th>
            <th scope="col" className={`text-right ${WIDE_ONLY}`}>
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={TD}>
              <td className="min-w-[9rem]">
                <Link href={repoPath(r)} className="font-medium text-ink hover:text-ink-soft">
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
                {r.length != null ? `${r.length.toLocaleString("en-US")} chars` : "—"}
              </td>
              <td className={`whitespace-nowrap text-right tabular-nums text-ink-dim ${WIDE_ONLY}`}>
                {compactStars(r.stars)}
              </td>
              <td className={`whitespace-nowrap text-ink-dim ${WIDE_ONLY}`}>{r.language ?? "—"}</td>
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

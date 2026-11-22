"use client";

import { compactStars } from "@/lib/utils/format";
import { repoPath } from "@/lib/utils/repo-path";

import { IntentLink } from "./IntentLink";
import { OwnRepoTag } from "./OwnRepoTag";
import { ScoreNumber } from "./ScoreNumber";

// On a phone the file link and its length are the point; the rest is on the repo page.
const WIDE_ONLY = "wide-only";

export type ExampleTableRow = {
  id: number;
  host: string;
  owner: string;
  name: string;
  file: string;
  fileUrl: string | null;
  length: number | null;
  stars: number | null;
  language: string | null;
  score: number | null;
};

export type Props = {
  rows: ExampleTableRow[];
  caption: string;
  /** Off on a one-language page, where every row would repeat it. */
  showLanguage?: boolean;
};

export function AgentsMdExampleTableView({ rows, caption, showLanguage = true }: Props) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region
    <section className="table-wrap" tabIndex={0} aria-label={caption}>
      <table className="data-table example-cells text-[14px]">
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
              <td>
                <IntentLink href={repoPath(r)} className="font-medium ink-link cover-link">
                  {r.owner}/<wbr />
                  {r.name}
                </IntentLink>
                <OwnRepoTag repo={r} />
              </td>
              <td>
                {r.fileUrl ? (
                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    aria-label={`${r.file} in ${r.owner}/${r.name} (new tab)`}
                    className="out-link dim-link"
                  >
                    {r.file} <span aria-hidden="true" className="icon-out" />
                  </a>
                ) : (
                  <span className="text-ink-dim">{r.file}</span>
                )}
              </td>
              <td>
                {r.length != null ? (
                  <>
                    {r.length.toLocaleString("en-US")}
                    <span> chars</span>
                  </>
                ) : (
                  "—"
                )}
              </td>
              <td>{compactStars(r.stars)}</td>
              {showLanguage && <td>{r.language ?? "—"}</td>}
              <td>
                <ScoreNumber score={r.score ?? 0} size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

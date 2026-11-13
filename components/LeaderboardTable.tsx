import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import type { BoardRow } from "@/lib/board";
import { HOST_LABELS, type Host } from "@/lib/constants/hosts";
import { compactStars } from "@/lib/utils/format";
import { sanitizeDescription } from "@/lib/utils/repo-about";
import { repoPath } from "@/lib/utils/repo-path";
import { BadgeAdoptedTag } from "./BadgeAdoptedTag";
import { HostPill } from "./HostPill";
import { Medal } from "./Medal";
import { OwnRepoTag } from "./OwnRepoTag";
import { ScoreCell } from "./ScoreCell";

/** What a row shows; both a database row and a browser board row fit it. */
type TableRow = Omit<BoardRow, "id" | "description"> & { description?: string | null; rank?: number };

type Props = {
  q: string;
  page: number;
  rows: TableRow[];
  totalPages: number;
  activeLabel: string;
  host: Host | "all";
  badge?: boolean;
  /** Where `rows` (already the page's slice) start, for rows that carry no `rank`. */
  startIdx: number;
  clearSearchHref: string;
  /** Clears the search in place instead of following `clearSearchHref`. */
  onClearSearch?: () => void;
  clearBadgeHref?: string;
  onClearBadge?: () => void;
  /** Rows are about to be replaced by a re-cut that is still loading. */
  busy?: boolean;
  /** Rows show as placeholders until the re-cut loads (styled by `data-board-pending`). */
  loading?: boolean;
  /** Replaces the rows, e.g. when the board data failed to load. */
  notice?: ReactNode;
};

// On the body, not each row: the board's HTML repeats a row's classes per row.
// Not on the notice row, whose cell keeps its own padding.
const ROW_CELLS =
  "*:[&>td]:border-b *:[&>td]:border-line *:[&>td]:px-3 *:[&>td]:py-[13px] *:[&>td]:text-[15px] *:hover:[&>td]:bg-surface-hover *:last:[&>td]:border-b-0 sm:*:[&>td]:px-[18px]";

export function LeaderboardTable({
  q,
  host,
  badge = false,
  page,
  rows,
  startIdx,
  totalPages,
  activeLabel,
  clearSearchHref,
  onClearSearch,
  clearBadgeHref,
  onClearBadge,
  busy = false,
  loading = false,
  notice,
}: Props) {
  const inPlace = (fn?: () => void) =>
    fn
      ? (e: MouseEvent) => {
          e.preventDefault();
          fn();
        }
      : undefined;
  const clearSearch = inPlace(onClearSearch);

  return (
    <div
      aria-busy={busy || loading || undefined}
      className={`overflow-x-auto rounded-xl border border-line bg-surface transition-opacity ${busy ? "opacity-60" : ""}`}
    >
      <table className="w-full border-separate border-spacing-0">
        <caption className="sr-only">
          Leaderboard — page {page} of {totalPages} for {activeLabel}
          {host !== "all" ? `, ${HOST_LABELS[host]} repos` : ""}
          {badge ? ", only repos showing the badge" : ""}
          {q ? `, filtered by "${q}"` : ""}
        </caption>

        <thead>
          <tr className="bg-surface-2 [&>th]:border-b [&>th]:border-line [&>th]:px-3 [&>th]:py-3 [&>th]:text-[11.5px] [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-[0.08em] [&>th]:text-muted sm:[&>th]:px-[18px]">
            <th scope="col" className="w-[56px] text-left">
              <span className="sr-only">Rank</span>
            </th>
            <th scope="col" className="text-left">
              Repo
            </th>
            <th scope="col" className="hidden text-right sm:table-cell">
              Stars
            </th>
            <th scope="col" className="text-right">
              Score
            </th>
            <th scope="col" className="hidden w-[90px] text-left sm:table-cell">
              <span className="sr-only">External link</span>
            </th>
          </tr>
        </thead>

        <tbody data-board-rows className={notice || rows.length === 0 ? undefined : ROW_CELLS}>
          {notice ? (
            <tr>
              <td colSpan={5} className="p-11 text-center text-[13px] text-muted">
                {notice}
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-11 text-center text-[13px] text-muted">
                {q ? (
                  <>
                    No repos match &ldquo;
                    <strong data-clarity-mask="true" className="text-ink">
                      {q}
                    </strong>
                    &rdquo;.{" "}
                    <Link href={clearSearchHref} onClick={clearSearch} className="text-ink-dim hover:text-ink-soft">
                      Clear search
                    </Link>
                    .
                  </>
                ) : badge ? (
                  <>
                    No {host === "all" ? "" : `${HOST_LABELS[host]} `}repo on this board shows the badge yet.{" "}
                    {clearBadgeHref ? (
                      <Link
                        href={clearBadgeHref}
                        onClick={inPlace(onClearBadge)}
                        className="text-ink-dim hover:text-ink-soft"
                      >
                        Show every {host === "all" ? "" : `${HOST_LABELS[host]} `}repo
                      </Link>
                    ) : null}
                  </>
                ) : (
                  <>
                    No repos yet. Run <code>bun run seed</code>.
                  </>
                )}
              </td>
            </tr>
          ) : (
            rows.map((r, i) => {
              const rank = r.rank ?? startIdx + i + 1;
              const description = sanitizeDescription(r.description);
              return (
                <tr
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable position keeps ScoreBar mounted so width transitions animate across re-renders
                  key={i}
                  className="relative cursor-pointer"
                >
                  <td className="tabular-nums text-muted">
                    <Medal rank={rank} />
                  </td>
                  <td>
                    <Link
                      href={repoPath(r)}
                      aria-label={`View ${r.owner}/${r.name} details`}
                      className="font-medium text-ink [overflow-wrap:anywhere] hover:text-ink-soft cover-link"
                    >
                      {r.owner}/{r.name}
                    </Link>
                    <OwnRepoTag repo={r} />
                    <HostPill host={r.host} />
                    {r.badge_embedded ? <BadgeAdoptedTag /> : null}
                    {/* No title tooltip: the row's link overlay covers it, and the repo page has the full text. */}
                    {description && (
                      <p className="m-0 mt-0.5 hidden max-w-[60ch] text-[12.5px] leading-snug text-muted sm:line-clamp-1">
                        {description}
                      </p>
                    )}
                  </td>
                  <td className="hidden text-right tabular-nums text-ink-dim sm:table-cell">
                    <span>{compactStars(r.stars)}</span>
                  </td>
                  <td className="text-right">
                    <ScoreCell score={r.score} />
                  </td>
                  {/* Below `sm` the table would scroll sideways; the repo page links the host anyway. */}
                  <td className="hidden sm:table-cell">
                    <a
                      href={r.url}
                      rel="noopener noreferrer"
                      target="_blank"
                      aria-label={`Open ${r.owner}/${r.name} on ${r.host} (new tab)`}
                      className="relative inline-flex items-center gap-1 whitespace-nowrap text-ink-dim hover:text-ink-soft"
                    >
                      open <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                    </a>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

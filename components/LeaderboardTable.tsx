import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { Host } from "@/lib/constants/hosts";
import type { LeaderboardRow } from "@/lib/types/db";
import { compactStars } from "@/lib/utils/format";
import { sanitizeDescription } from "@/lib/utils/repo-about";
import { repoPath } from "@/lib/utils/repo-path";
import { BadgeAdoptedTag } from "./BadgeAdoptedTag";
import { HostPill } from "./HostPill";
import { Medal } from "./Medal";
import { OwnRepoTag } from "./OwnRepoTag";
import { ScoreCell } from "./ScoreCell";

type Props = {
  q: string;
  page: number;
  rows: LeaderboardRow[];
  totalPages: number;
  activeLabel: string;
  host: Host | "all";
  /** Rank of `rows[0]` on the full board — rows are already the current page's slice. */
  startIdx: number;
  clearSearchHref: string;
};

export function LeaderboardTable({ q, host, page, rows, startIdx, totalPages, activeLabel, clearSearchHref }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full border-separate border-spacing-0">
        <caption className="sr-only">
          Leaderboard — page {page} of {totalPages} for {activeLabel}
          {host !== "all" ? `, host=${host}` : ""}
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

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-11 text-center text-[13px] text-muted">
                {q ? (
                  <>
                    No repos match &ldquo;
                    <strong data-clarity-mask="true" className="text-ink">
                      {q}
                    </strong>
                    &rdquo;.{" "}
                    <Link href={clearSearchHref} className="text-ink-dim hover:text-ink-soft">
                      Clear search
                    </Link>
                    .
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
              const rank = startIdx + i + 1;
              const description = sanitizeDescription(r.description);
              return (
                <tr
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable position keeps ScoreBar mounted so width transitions animate across re-renders
                  key={i}
                  className="relative cursor-pointer [&>td]:border-b [&>td]:border-line [&>td]:px-3 [&>td]:py-[13px] [&>td]:text-[15px] hover:[&>td]:bg-surface-hover last:[&>td]:border-b-0 sm:[&>td]:px-[18px]"
                >
                  <td className="tabular-nums text-muted">
                    <Medal rank={rank} />
                  </td>
                  <td>
                    <Link
                      href={repoPath(r)}
                      aria-label={`View ${r.owner}/${r.name} details`}
                      className="font-medium text-ink [overflow-wrap:anywhere] hover:text-ink-soft before:absolute before:inset-0 before:content-['']"
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
                  <td className="hidden text-right tabular-nums text-ink-dim sm:table-cell">{compactStars(r.stars)}</td>
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

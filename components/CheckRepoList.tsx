import Link from "next/link";

import type { LeaderboardRow } from "@/lib/types/db";
import { compactStars } from "@/lib/utils/format";
import { repoPath } from "@/lib/utils/repo-path";

import { ScoreNumber } from "./ScoreNumber";

export function CheckRepoList({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2 md:grid-cols-3">
      {rows.map((r) => (
        <li key={r.id} className="relative rounded-lg border border-line bg-surface-2 px-3.5 py-3">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={repoPath(r)}
              className="min-w-0 font-medium text-ink hover:text-ink-soft before:absolute before:inset-0 before:content-['']"
            >
              <span className="block truncate">
                {r.owner}/{r.name}
              </span>
            </Link>

            <ScoreNumber score={r.score ?? 0} size="sm" />
          </div>

          <div className="mt-1 text-[12px] text-muted">
            {r.language ?? "—"}
            {r.stars != null ? ` · ${compactStars(r.stars)}` : ""}
          </div>
        </li>
      ))}
    </ul>
  );
}

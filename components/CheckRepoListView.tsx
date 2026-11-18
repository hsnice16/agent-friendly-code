"use client";

import Link from "next/link";

import { compactStars } from "@/lib/utils/format";
import { repoPath } from "@/lib/utils/repo-path";

import { OwnRepoTag } from "./OwnRepoTag";
import { ScoreNumber } from "./ScoreNumber";

export type RepoTileRow = {
  id: number;
  host: string;
  owner: string;
  name: string;
  score: number | null;
  language: string | null;
  stars: number | null;
};

export function CheckRepoListView({ rows }: { rows: RepoTileRow[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2 md:grid-cols-3">
      {rows.map((r) => (
        <li key={r.id} className="relative tile">
          <div className="flex items-start justify-between gap-2">
            <Link href={repoPath(r)} className="min-w-0 truncate font-medium ink-link cover-link">
              {r.owner}/{r.name}
            </Link>

            <ScoreNumber score={r.score ?? 0} size="sm" />
          </div>

          <div className="mt-1 text-[12px] text-muted">
            {r.language ?? "—"}
            {r.stars != null ? ` · ${compactStars(r.stars)}` : ""}
            <OwnRepoTag repo={r} />
          </div>
        </li>
      ))}
    </ul>
  );
}

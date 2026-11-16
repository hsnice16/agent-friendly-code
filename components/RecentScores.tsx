"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { type RecentScore, readRecents } from "@/lib/live-score/recents";
import { liveScorePath, repoPath } from "@/lib/utils/repo-path";

import { HostPill } from "./HostPill";
import { OwnRepoTag } from "./OwnRepoTag";
import { Panel, PanelHeading } from "./Panel";
import { ScoreNumber } from "./ScoreNumber";

/** `id` marks an indexed repo — see `hrefFor`. */
type Row = RecentScore & { id?: number };

type Props = {
  /** Leaderboard rows, so there is something to look at before you have scored anything. */
  past: Row[];
};

// An indexed repo's /score/… URL only redirects to its repo page, at the cost
// of a cold server render first.
function hrefFor(row: Row): string {
  return row.id == null ? liveScorePath(row) : repoPath(row);
}

function ScoreList({ rows }: { rows: Row[] }) {
  return (
    <ul className="m-0 list-none p-0">
      {rows.map((row) => (
        <li key={`${row.host}/${row.owner}/${row.name}`} className="flex items-center justify-between gap-3 link-row">
          <span className="min-w-0 text-[14.5px] [overflow-wrap:anywhere]">
            <Link href={hrefFor(row)} className="ink-link cover-link">
              {row.owner}/{row.name}
            </Link>
            <OwnRepoTag repo={row} />
            <HostPill host={row.host} />
          </span>
          <ScoreNumber score={row.score} />
        </li>
      ))}
    </ul>
  );
}

export function RecentScores({ past }: Props) {
  // Read after mount: localStorage during render would mismatch the server HTML.
  const [mine, setMine] = useState<RecentScore[]>([]);

  useEffect(() => {
    setMine(readRecents());
  }, []);

  return (
    <>
      {mine.length > 0 && (
        <div className="mb-3.5">
          <Panel>
            <PanelHeading>Your recent scores</PanelHeading>
            <ScoreList rows={mine} />
          </Panel>
        </div>
      )}

      <Panel>
        <PanelHeading>Top repos on the leaderboard</PanelHeading>
        <ScoreList rows={past} />
      </Panel>
    </>
  );
}

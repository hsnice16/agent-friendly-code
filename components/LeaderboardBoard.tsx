import { toBoardRow } from "@/lib/board-data";
import type { LeaderboardView } from "@/lib/leaderboard-view";
import { MODEL_BY_ID, MODELS } from "@/lib/scoring/weights";
import type { LeaderboardStats } from "@/lib/types/db";
import { boardPage } from "@/lib/utils/board-item-list";
import { BoardClient } from "./BoardClient";
import { CodeText } from "./CodeText";
import { RelativeTime } from "./RelativeTime";

const AGENTS = [{ id: "overall" as const, label: "Overall" }, ...MODELS.map((m) => ({ id: m.id, label: m.label }))];

const DATE = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });

export function LeaderboardBoard({ view, stats }: { view: LeaderboardView; stats: LeaderboardStats }) {
  const { page, totalPages, model } = view;
  const { startIdx, rows } = boardPage(view);

  const activeLabel = model === "overall" ? "Overall" : MODEL_BY_ID[model].label;
  const rationale = model === "overall" ? "the average of every agent's score." : MODEL_BY_ID[model].rationale;

  return (
    <div data-board>
      <BoardClient
        key={`${model}:${page}`}
        model={model}
        agents={AGENTS}
        activeLabel={activeLabel}
        intro={
          <div className="mx-0.5 mb-5 -mt-0.5 max-w-[80ch] text-[13px] leading-[1.55] text-muted">
            <strong className="text-ink-dim">{activeLabel}</strong> — <CodeText text={rationale} />
          </div>
        }
        server={{ page, totalPages, startIdx, rows: rows.map(toBoardRow) }}
        summary={
          <p className="m-0 text-[12.5px] text-muted">
            Tracking <strong className="font-medium text-ink-dim">{stats.count}</strong>{" "}
            {stats.count === 1 ? "repo" : "repos"}
            {stats.lastScoredAt != null && (
              <>
                {" · "}last updated{" "}
                <RelativeTime
                  epochSec={stats.lastScoredAt}
                  fallback={DATE.format(new Date(stats.lastScoredAt * 1000))}
                />
              </>
            )}
          </p>
        }
      />
    </div>
  );
}

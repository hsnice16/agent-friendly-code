import { prefetchBoardData } from "@/lib/use-board-data";

const BUTTON = "text-ink-dim hover:text-ink-soft";

/** Shown in place of the rows when a re-cut can't be computed. */
export function BoardNotice({ reason }: { reason: "error" | "stale" }) {
  if (reason === "stale") {
    // The data came from a newer deploy that no longer has this board.
    return (
      <>
        The leaderboard was just updated.{" "}
        <button type="button" onClick={() => window.location.reload()} className={BUTTON}>
          Reload the page
        </button>
        .
      </>
    );
  }
  return (
    <>
      Couldn&rsquo;t load the leaderboard.{" "}
      <button type="button" onClick={prefetchBoardData} className={BUTTON}>
        Try again
      </button>
      .
    </>
  );
}

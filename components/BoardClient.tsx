"use client";

import {
  type MouseEvent,
  type ReactNode,
  startTransition,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { track } from "@/lib/analytics-events";
import {
  type BoardQuery,
  type BoardRow,
  type BoardView,
  boardRows,
  cleanQuery,
  DEFAULT_QUERY,
  isRecut,
  viewBoard,
} from "@/lib/board";
import { isPlainClick, readBoardLocation, writeBoardLocation } from "@/lib/board-location";
import type { ModelId } from "@/lib/scoring/weights";
import { prefetchBoardData, useBoardData } from "@/lib/use-board-data";
import { leaderboardHref } from "@/lib/utils/leaderboard-href";
import { BoardAgentPills } from "./BoardAgentPills";
import { BoardFilters, type FilterChange } from "./BoardFilters";
import { BoardResults } from "./BoardResults";
import { SearchBar } from "./SearchBar";
import { SEARCH_SETTLE_MS, useBoardPopState, useResultAnnouncement, useSearchTracking } from "./use-board-feedback";

type BoardId = ModelId | "overall";

type Props = {
  model: BoardId;
  agents: { id: BoardId; label: string }[];
  activeLabel: string;
  /** Sits between the agent pills and the toolbar. */
  intro: ReactNode;
  /** The prerendered page: the board as it is, uncut, at this page number. */
  server: { page: number; totalPages: number; startIdx: number; rows: BoardRow[] };
  /** How many repos are tracked; sits beside the pager. */
  summary: ReactNode;
};

// Set when a page link is followed to another prerendered page; the board
// there scrolls itself into view on mount instead of the page landing on its hero.
let scrollToBoardOnMount = false;

type ShownPage = Omit<BoardView, "total">;

export function BoardClient({ model, agents, activeLabel, intro, server, summary }: Props) {
  // Starts as the prerendered page so hydration matches; the address is read
  // in the first layout effect, before anything is painted.
  const [query, setQuery] = useState<BoardQuery>({ ...DEFAULT_QUERY, page: server.page });
  const [input, setInput] = useState("");
  const [synced, setSynced] = useState(false);
  const [openedRecut, setOpenedRecut] = useState(false);
  const [settledQ, setSettledQ] = useState("");

  const toolbarRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef(query);
  queryRef.current = query;
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastView = useRef<ShownPage>(server);

  const { status, data } = useBoardData();

  const needsData = isRecut(query) || query.page !== server.page;
  const rows = useMemo(() => (data ? boardRows(data, model) : null), [data, model]);
  // Data from a newer deploy that no longer has this board: the page itself is stale.
  const stale = data != null && !data.models.includes(model);
  const computed = useMemo(
    () => (needsData && rows && !stale ? viewBoard(rows, query) : null),
    [needsData, rows, stale, query],
  );

  let view: ShownPage = server;
  let notice: "stale" | "error" | null = null;
  let pending = false;
  let busy = false;
  if (needsData) {
    if (computed) {
      view = computed;
    } else {
      view = lastView.current;
      if (stale) {
        notice = "stale";
      } else if (status === "error") {
        notice = "error";
      } else if (openedRecut) {
        pending = true;
      } else {
        busy = true;
      }
    }
  }

  useEffect(() => {
    if (!pending && !busy && !notice) lastView.current = view;
  });

  // Once per mount: the server wrapper keys this component by board and page.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useLayoutEffect(() => {
    const read = readBoardLocation();
    const recut = isRecut(read) || read.page !== server.page;
    // An equal query keeps its identity, or hydration is followed by a render of every row.
    setQuery((prev) => (leaderboardHref({ model, ...prev }) === leaderboardHref({ model, ...read }) ? prev : read));
    setInput(read.q);
    setSettledQ(read.q);
    setOpenedRecut(recut);
    setSynced(true);
    if (recut) prefetchBoardData();

    // One address per view: drop unknown or default values a link carried.
    writeBoardLocation(leaderboardHref({ model, ...read }), "replace");

    if (scrollToBoardOnMount) {
      scrollToBoardOnMount = false;
      scrollToBoard();
    }
  }, []);

  // BoardPendingScript sets this before hydration; from here on it follows
  // React's state, and it can't outlive the board.
  useLayoutEffect(() => {
    if (!synced) return;
    document.documentElement.toggleAttribute("data-board-pending", pending);
  }, [synced, pending]);
  useEffect(() => () => document.documentElement.removeAttribute("data-board-pending"), []);

  useEffect(() => {
    if (needsData) prefetchBoardData();
  }, [needsData]);

  useBoardPopState(model, (read) => {
    clearTimeout(searchTimer.current);
    setQuery(read);
    setInput(read.q);
    setSettledQ(read.q);
  });

  // A page number past the end of a re-cut shows the last page; say so in the address.
  const shownPage = computed?.page;
  useEffect(() => {
    if (shownPage == null || shownPage === queryRef.current.page) return;
    const next = { ...queryRef.current, page: shownPage };
    setQuery(next);
    writeBoardLocation(leaderboardHref({ model, ...next }), "replace");
  }, [shownPage, model]);

  useEffect(() => () => clearTimeout(searchTimer.current), []);

  useSearchTracking(settledQ, stale ? null : rows, model, queryRef);
  const recut = isRecut(query);
  const announcement = useResultAnnouncement(recut, computed?.total);

  function scrollToBoard() {
    const el = toolbarRef.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
  }

  function write(next: BoardQuery, mode: "push" | "replace") {
    writeBoardLocation(leaderboardHref({ model, ...next }), mode);
  }

  // A change made before a search settled carries that search with it, into
  // the address and into GA.
  function settleSearch(q: string) {
    clearTimeout(searchTimer.current);
    searchTimer.current = undefined;
    setSettledQ(q);
  }

  // In a transition, so the control answers before the rows re-render, and a
  // keystroke that lands first drops the render for the one before it.
  function apply(next: BoardQuery) {
    settleSearch(next.q);
    startTransition(() => setQuery(next));
    write(next, "replace");
  }

  function onSearch(value: string) {
    const q = cleanQuery(value);
    const next = { ...query, q, page: q === query.q ? query.page : 1 };
    setInput(value);
    startTransition(() => setQuery(next));
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      searchTimer.current = undefined;
      write(queryRef.current, "replace");
      setSettledQ(queryRef.current.q);
    }, SEARCH_SETTLE_MS);
  }

  function clearSearch() {
    setInput("");
    apply({ ...query, q: "", page: 1 });
  }

  function clearBadge() {
    apply({ ...query, badge: false, page: 1 });
  }

  function onFilter({ patch, filter, option }: FilterChange) {
    apply({ ...query, ...patch, page: 1 });
    track({ name: "leaderboard_filter", filter, option });
  }

  function onPageClick(page: number, e: MouseEvent) {
    if (!isPlainClick(e)) return;
    // An uncut page is its own prerendered route, so the link loads it. Not when
    // a cleared search left this route showing a different page: following a
    // link to this same route would remount nothing.
    if (!recut && query.page === server.page) {
      scrollToBoardOnMount = true;
      // In case no board mounts to consume it, e.g. the navigation failed.
      setTimeout(() => {
        scrollToBoardOnMount = false;
      }, 5000);
      return;
    }
    e.preventDefault();
    if (searchTimer.current) {
      write(queryRef.current, "replace");
      settleSearch(queryRef.current.q);
    }
    const next = { ...query, page };
    setQuery(next);
    write(next, "push");
    scrollToBoard();
  }

  // Stable for BoardResults' memo; they call whichever handlers the latest render made.
  const handlers = useRef({ clearSearch, clearBadge, onPageClick });
  useLayoutEffect(() => {
    handlers.current = { clearSearch, clearBadge, onPageClick };
  });
  const stable = useMemo(
    () => ({
      clearSearch: () => handlers.current.clearSearch(),
      clearBadge: () => handlers.current.clearBadge(),
      onPageClick: (page: number, e: MouseEvent) => handlers.current.onPageClick(page, e),
    }),
    [],
  );

  const searching = input.trim() !== "" && needsData && !computed && !notice;

  return (
    <div>
      <BoardAgentPills agents={agents} selected={model} query={query} />

      {intro}

      {/* biome-ignore lint/a11y/noStaticElementInteractions: the handlers only start a download; the controls inside stay the interactive elements */}
      <div
        ref={toolbarRef}
        // The board data is fetched as soon as someone reaches for a control,
        // so a choice made a moment later is answered from memory.
        onPointerEnter={prefetchBoardData}
        onPointerDown={prefetchBoardData}
        onFocus={prefetchBoardData}
        className="mb-3 flex scroll-mt-20 flex-col gap-3 sm:flex-row sm:items-center"
      >
        <SearchBar value={input} onChange={onSearch} busy={searching} />

        <BoardFilters query={query} onChange={onFilter} />
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <BoardResults
        model={model}
        query={query}
        view={view}
        activeLabel={activeLabel}
        summary={summary}
        busy={busy}
        loading={pending}
        notice={notice}
        onClearSearch={stable.clearSearch}
        onClearBadge={stable.clearBadge}
        onPageClick={stable.onPageClick}
      />
    </div>
  );
}

import { MODELS } from "./scoring/weights";

// Boards are prerendered, so their pages moved from `?page=N` to `/page/N` and
// an agent's board from `/?model=<id>` to `/model/<id>`. As next.config rules
// these answer at the edge without running a function. A re-cut board (search,
// filter, sort) keeps `?page`, which the browser reads. Next appends the
// request's query to the destination, so `?page=1` can't redirect to its own
// path (a loop); the browser drops the leftovers instead.

const query = (key: string, value?: string) => ({ type: "query" as const, key, ...(value ? { value } : {}) });

const MODEL = `(?<model>${MODELS.map((m) => m.id).join("|")})`;
export const PAGE_2_PLUS = "(?<page>[2-9]|[1-9]\\d+)";
const RECUT_MISSING = ["q", "host", "sort", "dir"].map((key) => query(key));

export const BOARD_REDIRECTS = [
  // Before the model-only rule, so a legacy link with both takes one hop.
  {
    source: "/",
    has: [query("model", MODEL), query("page", PAGE_2_PLUS)],
    missing: RECUT_MISSING,
    destination: "/model/:model/page/:page",
    permanent: true,
  },
  { source: "/", has: [query("model", MODEL)], destination: "/model/:model", permanent: true },
  { source: "/page/1", destination: "/", permanent: true },
  { source: "/model/:slug/page/1", destination: "/model/:slug", permanent: true },
  {
    source: "/",
    has: [query("page", PAGE_2_PLUS)],
    missing: RECUT_MISSING,
    destination: "/page/:page",
    permanent: true,
  },
  {
    source: "/model/:slug",
    has: [query("page", PAGE_2_PLUS)],
    missing: RECUT_MISSING,
    destination: "/model/:slug/page/:page",
    permanent: true,
  },
];

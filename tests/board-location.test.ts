import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { runInNewContext } from "node:vm";
import { BOARD_PENDING_SCRIPT } from "../components/BoardPendingScript";
import { isRecut } from "../lib/board";
import { isBoardPath, readBoardLocation, writeBoardLocation } from "../lib/board-location";
import { BOARD_REDIRECTS, PAGE_2_PLUS } from "../lib/board-redirects";

const g = globalThis as unknown as { window?: unknown };

function at(href: string) {
  const url = new URL(href, "https://example.test");
  const calls: string[] = [];
  g.window = {
    location: { pathname: url.pathname, search: url.search, hash: "", origin: url.origin },
    history: {
      state: { __NA: true },
      pushState: (_s: unknown, _t: string, u: string) => calls.push(`push ${u}`),
      replaceState: (_s: unknown, _t: string, u: string) => calls.push(`replace ${u}`),
    },
  };
  return calls;
}

afterEach(() => {
  delete g.window;
});

const URLS = [
  "/",
  "/?sort=score",
  "/?sort=stars",
  "/?dir=asc",
  "/?q=%20",
  "/?q=re",
  "/?host=svn",
  "/?host=gitlab",
  "/?page=abc",
  "/?page=1",
  "/page/3",
  "/page/3?page=3",
  "/page/3?page=2",
  "/model/aider",
  "/model/aider?sort=stars",
  "/model/aider/page/4?q=x",
  "/repo/github/a/b?sort=stars",
];

describe("BoardPendingScript", () => {
  it("marks exactly the links the board re-cuts, and only on board paths", () => {
    for (const href of URLS) {
      at(href);
      const url = new URL(href, "https://example.test");
      let marked = false;
      const document = { documentElement: { setAttribute: () => (marked = true) } };
      runInNewContext(BOARD_PENDING_SCRIPT, { document, location: url, URLSearchParams });

      const onBoard = /^\/(model\/[^/]+\/?)?(page\/\d+)?$/.test(url.pathname);
      const q = readBoardLocation();
      const pathPage = Number(/\/page\/(\d+)$/.exec(url.pathname)?.[1] ?? 1);
      assert.equal(marked, onBoard && (isRecut(q) || q.page !== pathPage), href);
    }
  });
});

describe("board location", () => {
  it("takes the page from ?page when valid, else from the path", () => {
    at("/page/3?page=2");
    assert.equal(readBoardLocation().page, 2);
    at("/page/3?page=abc");
    assert.equal(readBoardLocation().page, 3);
    at("/model/aider?sort=stars");
    assert.deepEqual(readBoardLocation().sort, "stars");
  });

  it("recognises a board's own paths only", () => {
    at("/page/7");
    assert.equal(isBoardPath("/"), true);
    at("/model/aider/page/2");
    assert.equal(isBoardPath("/model/aider"), true);
    assert.equal(isBoardPath("/"), false);
    at("/repo/github/a/b");
    assert.equal(isBoardPath("/"), false);
  });

  it("keeps foreign params and the history state, and skips no-op writes", () => {
    const calls = at("/?utm_source=hn&model=x&sort=stars");
    writeBoardLocation("/?sort=stars", "replace");
    assert.deepEqual(calls, ["replace /?sort=stars&utm_source=hn"]);
    const none = at("/?sort=stars");
    writeBoardLocation("/?sort=stars", "push");
    assert.deepEqual(none, []);
  });
});

describe("board redirects", () => {
  it("matches only pages two and up", () => {
    const re = new RegExp(`^${PAGE_2_PLUS}$`);
    for (const ok of ["2", "9", "10", "34", "120"]) assert.ok(re.test(ok), ok);
    for (const bad of ["0", "1", "01", "abc", "2a", ""]) assert.ok(!re.test(bad), bad);
  });

  it("sends a legacy agent + page link to its page in one hop", () => {
    const [first] = BOARD_REDIRECTS;
    assert.equal(first.destination, "/model/:model/page/:page");
  });
});

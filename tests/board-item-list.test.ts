import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { homeJsonLdGraph } from "../components/HomeJsonLd";
import { LEADERBOARD_PAGE_SIZE } from "../lib/constants/scoring";
import type { LeaderboardRow } from "../lib/types/db";
import { boardItemList } from "../lib/utils/board-item-list";
import { APP_URL } from "../lib/version";

const rows = Array.from({ length: LEADERBOARD_PAGE_SIZE + 5 }, (_, i) => ({
  host: "github",
  owner: "o",
  name: `r${i}`,
  score: 90 - i,
})) as unknown as LeaderboardRow[];

type Item = { position: number; name: string };
const items = (list: ReturnType<typeof boardItemList>) => (list?.itemListElement ?? []) as Item[];
const types = (graph: Record<string, unknown>[]) => graph.map((n) => n["@type"]);

describe("boardItemList", () => {
  it("lists only the first page's rows on page 1", () => {
    const list = boardItemList({ page: 1, allRows: rows }, "Board");
    assert.equal(list?.numberOfItems, LEADERBOARD_PAGE_SIZE);
    assert.deepEqual(items(list)[0], {
      "@type": "ListItem",
      position: 1,
      name: "o/r0",
      url: `${APP_URL}/repo/github/o/r0`,
    });
  });

  it("numbers page 2 from its rank on the full board", () => {
    const list = boardItemList({ page: 2, allRows: rows }, "Board");
    assert.equal(list?.numberOfItems, 5);
    assert.deepEqual(
      items(list).map((i) => [i.position, i.name]),
      rows.slice(LEADERBOARD_PAGE_SIZE).map((r, i) => [LEADERBOARD_PAGE_SIZE + i + 1, `o/${r.name}`]),
    );
  });
});

describe("homeJsonLdGraph", () => {
  const graph = (page: number) => homeJsonLdGraph({ view: { page, allRows: rows }, contentChangedAt: 1_700_000_000 });

  it("puts the Dataset on the canonical home only", () => {
    assert.deepEqual(types(graph(1)), ["ItemList", "Dataset"]);
    assert.deepEqual(types(graph(2)), ["ItemList"]);
  });
});

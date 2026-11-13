import "./_temp-db";

import assert from "node:assert/strict";
import { after, describe, it } from "node:test";

import { boardRows, DEFAULT_QUERY, findBoardRepo, isRecut, parseBoardQuery, sortRows, viewBoard } from "../lib/board";
import { buildBoardData } from "../lib/board-data";
import { HOST_DOMAINS, HOSTS } from "../lib/constants/hosts";
import { LEADERBOARD_PAGE_SIZE } from "../lib/constants/scoring";
import { db, listLeaderboard, saveScoredRepo } from "../lib/db";
import type { ModelId } from "../lib/scoring/weights";

// Ties on score and on stars, missing stars, and every host: the cases where
// the browser's sort could drift from the SQL ORDER BY it replaces.
const SCORES = [70, 70, 55.5, 90, 70, 10, 55.5, 88, 70, 42];
const STARS = [100, null, 100, 5, 100, 0, null, 5, 2_000, 100];
const BOARDS: (ModelId | "overall")[] = ["overall", "claude-code", "aider"];

for (let i = 0; i < 30; i++) {
  const host = HOSTS[i % HOSTS.length];
  const name = `repo-${i}`;
  saveScoredRepo({
    host,
    name,
    owner: i % 4 === 0 ? "Acme" : "zeta",
    url:
      i === 7
        ? `https://mirror.example/${name}`
        : `https://${HOST_DOMAINS[host]}/${i % 4 === 0 ? "Acme" : "zeta"}/${name}`,
    overall: SCORES[i % SCORES.length],
    stars: STARS[(i * 3) % STARS.length],
    badgeEmbedded: i % 5 === 0,
    signals: [],
    about: { description: i % 2 ? `Description ${i}` : null, topics: [] },
    modelScores: [
      { modelId: "claude-code", modelLabel: "Claude Code", score: SCORES[(i + 3) % SCORES.length], contributions: [] },
      ...(i % 3
        ? [
            {
              modelId: "aider" as const,
              modelLabel: "Aider",
              score: SCORES[(i + 1) % SCORES.length],
              contributions: [],
            },
          ]
        : []),
    ],
  });
}

after(() => db.close());

const ids = (rows: { id: number }[]) => rows.map((r) => r.id);

describe("browser board", () => {
  const data = buildBoardData();

  it("orders every board exactly like the SQL it replaces", () => {
    for (const model of BOARDS) {
      const all = boardRows(data, model);
      for (const sort of ["score", "stars"] as const) {
        for (const dir of ["desc", "asc"] as const) {
          for (const host of [undefined, ...HOSTS]) {
            const sql = listLeaderboard({ model, sort, dir, host });
            const mine = sortRows(host ? all.filter((r) => r.host === host) : all, sort, dir);
            assert.deepEqual(ids(mine), ids(sql), `${model} ${sort} ${dir} ${host ?? "all"}`);
          }
        }
      }
    }
  });

  it("keeps each board's own membership and scores", () => {
    const aider = boardRows(data, "aider");
    assert.equal(aider.length, listLeaderboard({ model: "aider" }).length);
    assert.ok(aider.length < boardRows(data, "overall").length);
    for (const r of listLeaderboard({ model: "aider" })) {
      assert.equal(aider.find((a) => a.id === r.id)?.score, r.score);
    }
    assert.deepEqual(boardRows(data, "no-such-board"), []);
  });

  it("rebuilds each repo's URL, sending only the ones that differ", () => {
    const rows = boardRows(data, "overall");
    for (const r of listLeaderboard({ model: "overall" })) {
      assert.equal(rows.find((x) => x.id === r.id)?.url, r.url);
    }
    assert.equal(data.repos.filter((r) => r.u).length, 1);
  });

  it("searches owner/name case-insensitively and pages the matches", () => {
    const all = boardRows(data, "overall");
    const acme = viewBoard(all, { ...DEFAULT_QUERY, q: "acme/" });
    assert.equal(acme.total, 8);
    assert.ok(acme.rows.every((r) => r.owner === "Acme"));

    const last = viewBoard(all, { ...DEFAULT_QUERY, page: 99 });
    assert.equal(last.page, Math.ceil(30 / LEADERBOARD_PAGE_SIZE));
    assert.equal(last.startIdx, (last.page - 1) * LEADERBOARD_PAGE_SIZE);
    assert.equal(viewBoard(all, { ...DEFAULT_QUERY, q: "nothing" }).total, 0);
  });

  it("ranks a re-cut's rows by their place on the uncut board", () => {
    for (const model of BOARDS) {
      const all = boardRows(data, model);
      const rankOf = new Map(listLeaderboard({ model }).map((r, i) => [r.id, i + 1]));
      const views = [
        viewBoard(all, { ...DEFAULT_QUERY, dir: "asc" }),
        viewBoard(all, { ...DEFAULT_QUERY, sort: "stars" }),
        viewBoard(all, { ...DEFAULT_QUERY, q: "zeta/" }),
        viewBoard(all, { ...DEFAULT_QUERY, host: HOSTS[1] }),
      ];
      for (const v of views) {
        assert.ok(v.rows.length > 0);
        for (const r of v.rows) assert.equal(r.rank, rankOf.get(r.id), `${model} ${r.owner}/${r.name}`);
      }
      assert.notEqual(views[0].rows[0].rank, 1);
    }
  });

  it("finds a repo by host and name in any casing, and only on its own host", () => {
    const [host, other] = [HOSTS[0], HOSTS[1]];
    assert.deepEqual(findBoardRepo(data, { host, owner: "ACME", name: "REPO-0" }), {
      host,
      owner: "Acme",
      name: "repo-0",
    });
    assert.equal(findBoardRepo(data, { host: other, owner: "Acme", name: "repo-0" }), null);
    assert.equal(findBoardRepo(data, { host, owner: "Acme", name: "nope" }), null);
  });

  it("keeps only badge repos when the badge filter is on", () => {
    const all = boardRows(data, "overall");
    const badged = viewBoard(all, { ...DEFAULT_QUERY, badge: true });
    assert.equal(badged.total, all.filter((r) => r.badge_embedded === 1).length);
    assert.ok(badged.total > 0 && badged.total < all.length);
    assert.ok(badged.rows.every((r) => r.badge_embedded === 1));
  });
});

describe("parseBoardQuery", () => {
  it("falls back to defaults on unknown values, like the server did", () => {
    const q = parseBoardQuery(new URLSearchParams("q=%20axios%20&host=svn&sort=forks&dir=up&page=-3"));
    assert.deepEqual(q, { ...DEFAULT_QUERY, q: "axios" });
    assert.equal(isRecut(q), true);
    assert.equal(isRecut(parseBoardQuery(new URLSearchParams("sort=score&dir=desc&page=4"))), false);
  });

  it("reads the badge filter only from badge=1", () => {
    assert.equal(parseBoardQuery(new URLSearchParams("badge=1")).badge, true);
    assert.equal(parseBoardQuery(new URLSearchParams("badge=true")).badge, false);
    assert.equal(isRecut(parseBoardQuery(new URLSearchParams("badge=1"))), true);
  });
});

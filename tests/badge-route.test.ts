import "./_temp-db";
import "./_next-cache";

import assert from "node:assert/strict";
import { after, afterEach, describe, it } from "node:test";

import { GET } from "../app/api/badge/[...slug]/route";
import { db, saveScoredRepo } from "../lib/db";
import type { ModelScore } from "../lib/scoring/scorer";

saveScoredRepo({
  url: "https://github.com/o/listed",
  host: "github",
  owner: "o",
  name: "listed",
  overall: 72.5,
  signals: [],
  modelScores: [{ modelId: "claude-code", modelLabel: "Claude Code", score: 81.4, contributions: [] } as ModelScore],
});

after(() => db.close());

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function countFetches(): string[] {
  const calls: string[] = [];
  globalThis.fetch = (async (input: string | URL) => {
    calls.push(String(input));
    throw new TypeError("fetch failed");
  }) as typeof fetch;
  return calls;
}

async function get(path: string, query = ""): Promise<Response> {
  const slug = path.split("/");
  const res = await GET(new Request(`https://x.test/api/badge/${path}${query}`), { params: Promise.resolve({ slug }) });
  assert.equal(res.headers.get("Content-Type"), "image/svg+xml; charset=utf-8");
  return res;
}

const badge = async (path: string, query = "") => (await get(path, query)).text();
const maxAge = async (path: string) => (await get(path)).headers.get("Cache-Control")?.match(/max-age=(\d+)/)?.[1];

describe("badge route", () => {
  it("prints a board repo's stored score without scoring it live", async () => {
    const calls = countFetches();
    assert.match(await badge("github/o/listed.svg"), /aria-label="agent friendly: 72\.5"/);
    assert.match(await badge("github/o/listed.svg", "?model=claude-code"), /: 81\.4"/);
    assert.deepEqual(calls, []);
  });

  it("prints a dash for an agent the repo has no row for", async () => {
    assert.match(await badge("github/o/listed.svg", "?model=cursor"), /: —"/);
  });

  it("degrades to 'not scored' when the live fallback fails, cached only briefly", async () => {
    const calls = countFetches();
    assert.match(await badge("github/o/off-board.svg"), /: not scored"/);
    assert.ok(calls.length > 0, "the live fallback reached the host");
    assert.equal(await maxAge("github/o/off-board.svg"), "60");
    assert.equal(await maxAge("gitlab/o/n.svg"), "3600");
  });

  it("never reaches a host for a probe slug or an unsupported host", async () => {
    const calls = countFetches();
    for (const path of ["github/o/a b.svg", "github/../x.svg", "gitlab/o/n.svg", "nohost/o/n.svg"]) {
      assert.match(await badge(path), /: not scored"/, path);
    }
    assert.deepEqual(calls, []);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseLiveTarget } from "../lib/live-score/cached";

describe("parseLiveTarget", () => {
  it("parses a slug on a known host", () => {
    const parsed = parseLiveTarget({ host: "github", owner: "honojs", name: "hono" });
    assert.equal(parsed?.canonicalUrl, "https://github.com/honojs/hono");
  });

  it("accepts the dots, dashes and underscores hosts allow", () => {
    assert.ok(parseLiveTarget({ host: "github", owner: "a-b_c", name: "x.js" }));
  });

  it("rejects probes before any host call could be built from them", () => {
    for (const [host, owner, name] of [
      ["github", "..", "x"],
      ["github", "o", "."],
      ["github", "o", "a b"],
      ["github", "o", "a%2Fb"],
      ["github", "<script>", "x"],
      ["github", "", "x"],
      ["nohost", "o", "n"],
      ["GitHub", "o", "n"],
    ]) {
      assert.equal(parseLiveTarget({ host, owner, name }), null, `${host}/${owner}/${name}`);
    }
  });
});

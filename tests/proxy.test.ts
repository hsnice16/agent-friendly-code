import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { NextRequest } from "next/server";

import { proxy } from "../proxy";

const run = (path: string) => proxy(new NextRequest(`https://x.test${path}`));

describe("proxy", () => {
  it("308s the retired agents page to the hub section, keeping the query", () => {
    const res = run("/language/Kotlin/agents?ref=a");
    assert.equal(res.status, 308);
    assert.equal(res.headers.get("Location"), "https://x.test/language/kotlin?ref=a#agents");
  });

  it("passes a canonical hub through", () => {
    assert.equal(run("/language/kotlin").headers.get("Location"), null);
  });
});

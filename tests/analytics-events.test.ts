import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { track } from "../lib/analytics-events";

const g = globalThis as { window?: { gtag?: (...args: unknown[]) => void } };

afterEach(() => {
  delete g.window;
});

describe("track", () => {
  it("sends the event name and its params to gtag", () => {
    const calls: unknown[][] = [];
    g.window = { gtag: (...args) => calls.push(args) };

    track({ name: "share_score", network: "bluesky" });
    assert.deepEqual(calls, [["event", "share_score", { network: "bluesky" }]]);
  });

  it("is a no-op before gtag loads", () => {
    g.window = {};
    assert.doesNotThrow(() => track({ name: "badge_copy", page: "repo" }));
  });

  it("never lets a gtag failure reach the click handler", () => {
    g.window = {
      gtag: () => {
        throw new Error("blocked");
      },
    };
    assert.doesNotThrow(() => track({ name: "live_score_submit", host: "github" }));
  });
});

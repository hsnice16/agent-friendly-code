import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SIGNALS } from "../lib/scoring/signals";
import { checkCrumb, checkPath } from "../lib/utils/check-path";

describe("checkCrumb", () => {
  // A path like `.cursor/rules` reads as a path; only a spaced slash reads as the trail's separator.
  it("names every check without the trail's separator", () => {
    for (const s of SIGNALS) {
      const crumb = checkCrumb(s.id);
      assert.ok(!crumb.name.includes(" / "), crumb.name);
      assert.equal(crumb.path, checkPath(s.id));
    }
  });
});

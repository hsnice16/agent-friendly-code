import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import { requestHeaders } from "../lib/live-score/hosts";

describe("requestHeaders", () => {
  test("GitLab's token goes in Authorization, which fetch drops on a cross-origin redirect", () => {
    const h = requestHeaders("gitlab", "t");
    assert.equal(h.Authorization, "Bearer t");
    assert.equal("PRIVATE-TOKEN" in h, false);
  });

  test("no token, no Authorization", () => {
    assert.equal("Authorization" in requestHeaders("gitlab"), false);
  });
});

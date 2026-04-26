import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { openhandsSetup } from "../../lib/scoring/signals/openhands-setup";
import { makeFixture, removeFixture } from "../_helpers";

describe("openhandsSetup signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 when .openhands/setup.sh is missing", () => {
    fixture = makeFixture({ "README.md": "irrelevant" });
    assert.equal(openhandsSetup.check(fixture).pass, 0);
  });

  test("pass=0.2 when setup.sh is empty", () => {
    fixture = makeFixture({ ".openhands/setup.sh": "" });
    assert.equal(openhandsSetup.check(fixture).pass, 0.2);
  });

  test("pass=1 when setup.sh has content", () => {
    fixture = makeFixture({
      ".openhands/setup.sh": "#!/usr/bin/env bash\nbun install\nbun run init-db",
    });
    const r = openhandsSetup.check(fixture);

    assert.equal(r.pass, 1);
    assert.match(r.matchedPath ?? "", /\.openhands\/setup\.sh$/);
  });
});

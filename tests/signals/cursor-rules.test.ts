import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { cursorRules } from "../../lib/scoring/signals/cursor-rules";
import { makeFixture, removeFixture } from "../_helpers";

describe("cursorRules signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 when neither modern nor legacy file exists", () => {
    fixture = makeFixture({ "README.md": "irrelevant" });
    const r = cursorRules.check(fixture);

    assert.equal(r.pass, 0);
    assert.equal(r.matchedPath, undefined);
  });

  test("pass=1 when .cursor/rules/ contains at least one .mdc file", () => {
    fixture = makeFixture({
      ".cursor/rules/style.mdc": "---\nname: style\n---\nUse Tailwind.",
    });
    const r = cursorRules.check(fixture);

    assert.equal(r.pass, 1);
    assert.match(r.matchedPath ?? "", /\.cursor\/rules\/style\.mdc$/);
  });

  test("pass=0 when .cursor/rules/ exists but contains no .mdc files", () => {
    fixture = makeFixture({ ".cursor/rules/notes.txt": "not an mdc" });
    assert.equal(cursorRules.check(fixture).pass, 0);
  });

  test("pass=0.5 for legacy .cursorrules file", () => {
    fixture = makeFixture({ ".cursorrules": "Use Tailwind. Prefer RSC." });
    const r = cursorRules.check(fixture);

    assert.equal(r.pass, 0.5);
    assert.equal(r.matchedPath, ".cursorrules");
  });

  test("modern .cursor/rules/*.mdc takes precedence over legacy .cursorrules", () => {
    fixture = makeFixture({
      ".cursorrules": "legacy content",
      ".cursor/rules/style.mdc": "---\nname: style\n---\nmodern",
    });

    assert.equal(cursorRules.check(fixture).pass, 1);
  });
});

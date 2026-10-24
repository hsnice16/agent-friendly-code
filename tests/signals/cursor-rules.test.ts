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

  test("a directory named *.mdc is not a rule file", () => {
    fixture = makeFixture({ ".cursor/rules/style.mdc/README.md": "not a rule" });
    assert.equal(cursorRules.check(fixture).pass, 0);
  });

  test("counts .mdc files in subfolders of .cursor/rules/", () => {
    fixture = makeFixture({ ".cursor/rules/frontend/components.mdc": "rule", ".cursor/rules/api.mdc": "rule" });
    const r = cursorRules.check(fixture);

    assert.equal(r.pass, 1);
    assert.equal(r.detail, "2 .mdc files in .cursor/rules/");
  });

  test("counts a .cursor/rules/ folder in a subdirectory, and links the root one first", () => {
    fixture = makeFixture({ "packages/web/.cursor/rules/ui.mdc": "rule" });
    const nested = cursorRules.check(fixture);
    assert.equal(nested.pass, 1);
    assert.equal(nested.matchedPath, "packages/web/.cursor/rules/ui.mdc");
    removeFixture(fixture);

    fixture = makeFixture({ "a/.cursor/rules/ui.mdc": "rule", ".cursor/rules/z.mdc": "rule" });
    const both = cursorRules.check(fixture);
    assert.equal(both.matchedPath, ".cursor/rules/z.mdc");
    assert.equal(both.detail, "2 .mdc files in .cursor/rules/ folders");
  });

  test("looks for .cursor/rules/ folders only three directories down", () => {
    fixture = makeFixture({ "a/b/c/.cursor/rules/x.mdc": "rule" });
    assert.equal(cursorRules.check(fixture).pass, 1);
    removeFixture(fixture);

    fixture = makeFixture({ "a/b/c/d/.cursor/rules/x.mdc": "rule", "node_modules/p/.cursor/rules/y.mdc": "rule" });
    assert.equal(cursorRules.check(fixture).pass, 0);
  });

  test("a plain .md in .cursor/rules/ is not a rule file", () => {
    fixture = makeFixture({ ".cursor/rules/style.md": "Cursor ignores this" });
    assert.equal(cursorRules.check(fixture).pass, 0);
  });

  test("counts only the .mdc files, not .mdc directories beside them", () => {
    fixture = makeFixture({ ".cursor/rules/a.mdc": "rule", ".cursor/rules/b.mdc/x": "" });
    assert.equal(cursorRules.check(fixture).detail, "1 .mdc file in .cursor/rules/");
  });
});

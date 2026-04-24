import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";
import { size } from "../../lib/scoring/signals/size";
import { type FixtureFiles, makeFixture, removeFixture } from "../_helpers";

function seededFiles(n: number, prefix = "src/f"): FixtureFiles {
  const files: FixtureFiles = {};
  for (let i = 0; i < n; i++) {
    files[`${prefix}${i}.ts`] = `export const v${i} = ${i};`;
  }
  return files;
}

describe("size signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0.9 for a very small repo (<50 files)", () => {
    fixture = makeFixture(seededFiles(10));
    const r = size.check(fixture);

    assert.equal(r.pass, 0.9);
  });

  test("pass=1 for the sweet-spot size (50 ≤ count < 500)", () => {
    fixture = makeFixture(seededFiles(80));
    assert.equal(size.check(fixture).pass, 1);
  });

  test("pass=0.8 for mid-sized repos (500 ≤ count < 2000)", () => {
    fixture = makeFixture(seededFiles(520));
    assert.equal(size.check(fixture).pass, 0.8);
  });

  test("ignores dotfiles and dot-directories when counting", () => {
    fixture = makeFixture({
      "src/a.ts": "",
      "src/b.ts": "",
      ".hidden/a.ts": "",
      ".hidden/b.ts": "",
    });

    const r = size.check(fixture);
    assert.match(r.detail, /^2 /);
  });
});

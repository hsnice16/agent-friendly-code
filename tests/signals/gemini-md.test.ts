import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { geminiMd } from "../../lib/scoring/signals/gemini-md";
import { makeFixture, removeFixture } from "../_helpers";

describe("geminiMd signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 when no GEMINI.md exists", () => {
    fixture = makeFixture({ "README.md": "irrelevant" });
    assert.equal(geminiMd.check(fixture).pass, 0);
  });

  test("pass=0.2 for empty GEMINI.md", () => {
    fixture = makeFixture({ "GEMINI.md": "" });
    assert.equal(geminiMd.check(fixture).pass, 0.2);
  });

  test("pass=0.5 for thin file (<200 chars)", () => {
    fixture = makeFixture({ "GEMINI.md": "Short notes." });
    assert.equal(geminiMd.check(fixture).pass, 0.5);
  });

  test("pass=0.8 for moderate file (200 ≤ len < 800)", () => {
    fixture = makeFixture({ "GEMINI.md": "x".repeat(500) });
    assert.equal(geminiMd.check(fixture).pass, 0.8);
  });

  test("pass=1 for substantive file (≥800 chars)", () => {
    fixture = makeFixture({ "GEMINI.md": "x".repeat(1200) });
    const r = geminiMd.check(fixture);

    assert.equal(r.pass, 1);
    assert.match(r.matchedPath ?? "", /GEMINI\.md$/i);
  });

  test("counts an imported AGENTS.md toward the length", () => {
    fixture = makeFixture({ "GEMINI.md": "@AGENTS.md\n", "AGENTS.md": "x".repeat(1200) });
    assert.equal(geminiMd.check(fixture).pass, 1);
    removeFixture(fixture);

    fixture = makeFixture({ "GEMINI.md": "# Notes\r\n@./agents.md\r\n", "AGENTS.md": "x".repeat(300) });
    assert.equal(geminiMd.check(fixture).pass, 0.8);
  });

  test("leaves other imports, and a missing AGENTS.md, as the line they are", () => {
    fixture = makeFixture({ "GEMINI.md": "@docs/guide.md\n@AGENTS.md", "docs/guide.md": "x".repeat(1200) });
    assert.equal(geminiMd.check(fixture).pass, 0.5);
  });

  test("does not inline an import shown in a code block", () => {
    fixture = makeFixture({
      "GEMINI.md": "Import it like this:\n\n```\n@AGENTS.md\n```\n",
      "AGENTS.md": "x".repeat(1200),
    });
    assert.equal(geminiMd.check(fixture).pass, 0.5);
  });

  test("matches case-insensitively", () => {
    fixture = makeFixture({ "Gemini.md": "x".repeat(1200) });
    assert.equal(geminiMd.check(fixture).pass, 1);
  });

  test("matches the former single-regex expansion on generated files", () => {
    // The pattern the line scan replaced, kept as the reference.
    const OLD =
      /^[ \t]*(?:```|~~~)[^\n]*\n[\s\S]*?^[ \t]*(?:```|~~~)[ \t]*\r?$|^[ \t]*@(?:\.\/)?([^\s/]+\.md)[ \t]*\r?$/gim;
    const agents = "a".repeat(250);
    const expected = (text: string) =>
      text.replace(OLD, (m, name?: string) => (name?.toLowerCase() === "agents.md" ? agents : m)).trim().length;
    const parts = [
      "```js",
      "```",
      "~~~",
      "  ```",
      "@AGENTS.md",
      "@./agents.md",
      "@docs/x.md",
      "text",
      "",
      "  @AGENTS.md  ",
    ];
    let seed = 7;
    const rand = (n: number) => {
      seed = (seed * 1103515245 + 12345) % 2 ** 31;
      return seed % n;
    };

    for (let k = 0; k < 400; k++) {
      const eol = rand(3) === 0 ? "\r\n" : "\n";
      const text = Array.from({ length: 1 + rand(12) }, () => parts[rand(parts.length)]).join(eol);
      fixture = makeFixture({ "GEMINI.md": text, "AGENTS.md": agents });
      const detail = geminiMd.check(fixture).detail;
      const len = expected(text);
      assert.ok(
        len === 0 ? /empty/.test(detail) : detail.includes(`(${len.toLocaleString("en-US")} characters)`),
        `${JSON.stringify(text)}: ${detail}`,
      );
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("stays fast on a hostile file", () => {
    const start = performance.now();
    fixture = makeFixture({ "GEMINI.md": "```x\n".repeat(200_000), "AGENTS.md": "x".repeat(100_000) });
    geminiMd.check(fixture);
    removeFixture(fixture);

    fixture = makeFixture({ "GEMINI.md": "@AGENTS.md\n".repeat(90_000), "AGENTS.md": "x".repeat(1_000_000) });
    assert.equal(geminiMd.check(fixture).pass, 1);
    assert.ok(performance.now() - start < 3000, `took ${performance.now() - start} ms`);
  });
});

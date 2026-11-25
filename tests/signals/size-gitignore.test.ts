import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import ignore from "ignore";
import { safeIgnoreLines, size } from "../../lib/scoring/signals/size";
import { type FixtureFiles, makeFixture, removeFixture } from "../_helpers";

// Shaped to make the backtracking regexes `ignore` builds fail slowly: long
// runs of the literal the patterns look for, nested as deep as the walk goes.
const HOSTILE_PATHS = Array.from({ length: 10000 }, (_, i) =>
  i % 2 ? "a".repeat(66) + String(i).padStart(4, "0") : `${"a/".repeat(9)}a${i}`,
);

describe("safeIgnoreLines", () => {
  test("hostile lines no longer stall 10,000 path checks", () => {
    const hostile = [
      "**/**/**/**/**/**/**/**/**/x",
      `${"**/".repeat(30)}x`,
      "*a*a*a*a*a*a*a*a*b",
      "*a*a*b",
      "**/*a*/**/*a*/**/b",
      `${"x".repeat(300)}*`,
    ].join("\n");

    const time = (lines: string[]) => {
      const ig = ignore().add(lines);
      const start = performance.now();
      for (const p of HOSTILE_PATHS) ig.ignores(p);
      return performance.now() - start;
    };

    // Against one plain line on the same paths, not a wall-clock limit: the
    // parallel suite slows both alike. Unsanitised, these took over 1,000×.
    const baseline = time(["*.log"]);
    const ms = time(safeIgnoreLines(hostile));
    assert.ok(ms < 10 * baseline + 50, `${ms.toFixed(0)}ms vs ${baseline.toFixed(0)}ms`);
  });

  test("collapses `**` runs to the one they mean", () => {
    assert.deepEqual(safeIgnoreLines("**/**/**/x\na/**/**/b\nq/**/**\n**/**"), ["**/x", "a/**/b", "q/**", "**"]);
  });

  test("drops lines past the wildcard, length and count bounds", () => {
    assert.deepEqual(safeIgnoreLines("*a*a*b\n**/*a*/**/b\n**/*.tfstate.*\n*.min.*"), ["**/*.tfstate.*", "*.min.*"]);
    assert.deepEqual(safeIgnoreLines(`${"x".repeat(257)}\nok`), ["ok"]);

    const many = Array.from({ length: 1500 }, (_, i) => `f${i}`).join("\n");
    const kept = safeIgnoreLines(`# header\n\n${many}`);
    assert.equal(kept.length, 1000);
    assert.equal(kept[0], "f0");
  });

  test("normal patterns match exactly as before", () => {
    const normal = "# deps\nnode_modules/\n*.log\n!keep.log\n**/dist\n/build\na/**/b\n\n.env*.local\n*.py[cod]\n";
    const before = ignore().add(normal);
    const after = ignore().add(safeIgnoreLines(normal));

    const paths = [
      "node_modules/",
      "pkg/node_modules/",
      "x.log",
      "logs/y.log",
      "keep.log",
      "sub/keep.log",
      "dist/",
      "packages/app/dist/",
      "build/",
      "src/build/",
      "a/b",
      "a/x/y/b",
      "b/a",
      ".env.local",
      ".env.production.local",
      "m/c.pyc",
      "src/index.ts",
    ];

    for (const p of paths) {
      assert.equal(after.ignores(p), before.ignores(p), p);
    }
    assert.ok(after.ignores("pkg/node_modules/") && !after.ignores("keep.log") && !after.ignores("src/build/"));
  });
});

describe("size signal on a hostile tree", () => {
  // 100-char names seven deep stay under macOS's 1,024-byte PATH_MAX.
  const deep = Array(7).fill("a".repeat(100)).join("/");

  function timed(gitignore: string, name: (i: number) => string): number {
    const files: FixtureFiles = { ".gitignore": gitignore };
    for (let i = 0; i < 1000; i++) files[`${deep}/${name(i)}`] = "";
    const fixture = makeFixture(files);

    try {
      const start = performance.now();
      assert.match(size.check(fixture).detail, /^1000 files/);
      return performance.now() - start;
    } finally {
      removeFixture(fixture);
    }
  }

  test("Node's stock `report.[0-9]*…` line against names built to backtrack it", () => {
    const ms = timed("report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json", (i) => `report.${"1.".repeat(45)}${i}`);
    assert.ok(ms < 1000, `${ms.toFixed(0)}ms`);
  });

  test("a thousand in-bounds quadratic lines stop at the work budget", () => {
    const lines = Array.from({ length: 1000 }, (_, i) => `*a*/**/b${i}`).join("\n");
    const ms = timed(lines, (i) => `${"a".repeat(95)}${i}`);
    assert.ok(ms < 3000, `${ms.toFixed(0)}ms`);
  });
});

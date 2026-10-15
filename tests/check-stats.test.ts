import "./_temp-db";

import { strict as assert } from "node:assert";
import { after, describe, mock, test } from "node:test";

import { checkRates } from "../lib/check-rates";
import { getCheckStats } from "../lib/check-stats";
import { db, saveScoredRepo } from "../lib/db";
import type { SignalResult } from "../lib/scoring/signals";

const signal = (id: string, pass: number): SignalResult => ({ id, pass, label: id, detail: "" });

function save(name: string, signals: SignalResult[], language: string | null = null): void {
  saveScoredRepo({
    name,
    signals,
    language,
    owner: "o",
    overall: 50,
    host: "github",
    modelScores: [],
    url: `https://github.com/o/${name}`,
  });
}

after(() => db.close());

describe("getCheckStats memo", () => {
  test("a signal change saved within the same second recomputes", () => {
    // One fixed second, so the save moves no timestamp a stats-based key could see.
    mock.timers.enable({ apis: ["Date"], now: 1_700_000_000_000 });
    try {
      save("memo", [signal("agents_md", 0)]);
      assert.equal(getCheckStats("agents_md").full, 0);

      save("memo", [signal("agents_md", 1)]);
      assert.equal(getCheckStats("agents_md").full, 1);
    } finally {
      mock.timers.reset();
    }
  });
});

describe("checkRates", () => {
  for (let i = 0; i < 5; i++) {
    save(`cpp${i}`, [signal("readme", i < 4 ? 1 : 0)], i % 2 ? "C++" : "c++");
  }
  save("rust", [signal("readme", 1)], "Rust");

  test("matches the hub whatever the casing of the repo's language", () => {
    const rates = checkRates([signal("readme", 1)], "C++");
    assert.deepEqual(rates.readme, { all: 5 / 6, language: 4 / 5 });
    assert.deepEqual(checkRates([signal("readme", 1)], "c++"), rates);
  });

  test("a language with no hub has a null language rate", () => {
    assert.deepEqual(checkRates([signal("readme", 1)], "Rust").readme, { all: 5 / 6, language: null });
  });
});

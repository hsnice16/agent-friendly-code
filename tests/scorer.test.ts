import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { scoreRepo, topImprovements } from "../lib/scoring/scorer";
import { SIGNALS } from "../lib/scoring/signals";
import type { SignalResult } from "../lib/scoring/signals/types";
import { MODELS, type ModelProfile } from "../lib/scoring/weights";
import { type FixtureFiles, makeFixture, removeFixture } from "./_helpers";

function ciYaml(): string {
  return "name: ci\non: [push]\njobs: { test: { runs-on: ubuntu-latest, steps: [] } }\n";
}

function richFixtureFiles(): FixtureFiles {
  return {
    LICENSE: "MIT",
    "biome.json": "{}",
    "tsconfig.json": "{}",
    Dockerfile: "FROM node:20",
    "CONTRIBUTING.md": "contrib",
    "AGENTS.md": "x".repeat(1500),
    "README.md": "y".repeat(1500),
    "GEMINI.md": "g".repeat(1500),
    "docker-compose.yml": "services: {}",
    ".github/workflows/ci.yml": ciYaml(),
    "src/index.ts": "export const x = 1;",
    "tests/smoke.test.ts": "// placeholder",
    ".aider.conf.yml": "test-cmd: bun run test",
    "lefthook.yml": "pre-commit:\n  commands: {}",
    ".openhands/setup.sh": "#!/usr/bin/env bash\nbun install",
    ".cursor/rules/style.mdc": "---\nname: style\n---\nUse Tailwind.",
    "package.json": JSON.stringify({
      name: "demo",
      scripts: { dev: "d", build: "b", test: "t" },
    }),
  };
}

function sparseFixtureFiles(): FixtureFiles {
  return { "src/index.ts": "export const x = 1;" };
}

describe("scoreRepo", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("returns one result per signal with pass ∈ [0, 1]", () => {
    fixture = makeFixture(sparseFixtureFiles());
    const result = scoreRepo(fixture);

    assert.equal(result.signals.length, SIGNALS.length);

    for (const s of result.signals) {
      assert.ok(s.pass >= 0 && s.pass <= 1, `pass out of range for ${s.id}`);
    }
  });

  test("returns one modelScore per model with overall as their average", () => {
    fixture = makeFixture(sparseFixtureFiles());
    const result = scoreRepo(fixture);

    assert.equal(result.modelScores.length, MODELS.length);

    const avg = result.modelScores.reduce((a, b) => a + b.score, 0) / result.modelScores.length;

    assert.equal(result.overall, Math.round(avg * 10) / 10);
  });

  test("a fixture with every artifact scores near-perfect across all models", () => {
    fixture = makeFixture(richFixtureFiles());
    const result = scoreRepo(fixture);

    for (const m of result.modelScores) {
      assert.ok(m.score >= 95, `${m.modelId} scored ${m.score}, expected ≥ 95`);
    }

    assert.ok(result.overall >= 95);
  });

  test("a sparse fixture scores low and flags the expected signals as failing", () => {
    fixture = makeFixture(sparseFixtureFiles());
    const result = scoreRepo(fixture);

    assert.ok(result.overall < 30, `overall was ${result.overall}, expected < 30`);

    const failedIds = result.signals.filter((s) => s.pass === 0).map((s) => s.id);

    for (const id of ["agents_md", "tests", "ci", "linter", "license", "contributing", "pre_commit"]) {
      assert.ok(failedIds.includes(id), `expected ${id} to fail but got pass>0`);
    }
  });

  test("matchedPath is repo-relative, never absolute", () => {
    fixture = makeFixture(richFixtureFiles());
    const result = scoreRepo(fixture);

    for (const s of result.signals) {
      if (s.matchedPath) {
        assert.ok(!s.matchedPath.startsWith("/"), `${s.id} leaked absolute path: ${s.matchedPath}`);
      }
    }
  });

  test("an injected models array overrides the default MODELS", () => {
    fixture = makeFixture(richFixtureFiles());
    const onlyClaude: ModelProfile[] = MODELS.filter((m) => m.id === "claude-code");
    const result = scoreRepo(fixture, onlyClaude);

    assert.equal(result.modelScores.length, 1);
    assert.equal(result.modelScores[0].modelId, "claude-code");
    assert.equal(result.overall, result.modelScores[0].score);
  });

  test("an empty models array yields overall 0 and no model scores", () => {
    fixture = makeFixture(sparseFixtureFiles());
    const result = scoreRepo(fixture, []);

    assert.equal(result.modelScores.length, 0);
    assert.equal(result.overall, 0);
    assert.equal(result.signals.length, SIGNALS.length);
  });
});

describe("topImprovements", () => {
  function makeSignals(passMap: Record<string, number>): SignalResult[] {
    return SIGNALS.map((s) => ({
      id: s.id,
      label: s.label,
      detail: "fixture",
      pass: passMap[s.id] ?? 1,
    }));
  }

  test("returns an empty list when every signal passes fully", () => {
    const signals = makeSignals({});
    assert.deepEqual(topImprovements("claude-code", signals), []);
  });

  test("returns an empty list when the model id is unknown", () => {
    const signals = makeSignals({ agents_md: 0 });
    assert.deepEqual(topImprovements("not-a-model" as never, signals), []);
  });

  test("orders suggestions by score-gain descending", () => {
    const signals = makeSignals({ agents_md: 0, tests: 0, license: 0 });
    const got = topImprovements("claude-code", signals, 3);

    assert.equal(got.length, 3);
    for (let i = 1; i < got.length; i++) {
      assert.ok(got[i - 1].scoreGain >= got[i].scoreGain);
    }

    const ids = got.map((g) => g.signalId);
    assert.ok(ids.indexOf("agents_md") < ids.indexOf("license"));
  });

  test("honours the limit parameter", () => {
    const signals = makeSignals({
      ci: 0,
      tests: 0,
      readme: 0,
      license: 0,
      agents_md: 0,
    });

    assert.equal(topImprovements("claude-code", signals, 2).length, 2);
  });

  test("each suggestion carries a non-empty improveSuggestion string", () => {
    const signals = makeSignals({ agents_md: 0, tests: 0 });
    for (const s of topImprovements("claude-code", signals)) {
      assert.ok(s.suggestion.length > 0, `missing suggestion for ${s.signalId}`);
    }
  });

  test("partial passes yield a proportionally smaller score gain", () => {
    const zero = topImprovements("claude-code", makeSignals({ agents_md: 0 }), 1)[0];

    const half = topImprovements("claude-code", makeSignals({ agents_md: 0.5 }), 1)[0];

    assert.ok(zero.scoreGain > half.scoreGain);
  });

  test("respects an injected models array", () => {
    const customWeights = { ...MODELS[0].weights, agents_md: 0, tests: 100 };
    const customModels: ModelProfile[] = [{ ...MODELS[0], weights: customWeights }];

    const signals = makeSignals({ agents_md: 0, tests: 0 });
    const got = topImprovements("claude-code", signals, 5, customModels);

    assert.ok(got.length > 0);
    assert.equal(got[0].signalId, "tests");
  });

  test("returns empty when the model id is not in the injected models array", () => {
    const onlyClaude = MODELS.filter((m) => m.id === "claude-code");
    const signals = makeSignals({ agents_md: 0 });

    assert.deepEqual(topImprovements("cursor", signals, 5, onlyClaude), []);
  });
});

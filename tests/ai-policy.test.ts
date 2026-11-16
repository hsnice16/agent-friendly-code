import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import raw from "../data/ai-policy.json";
import {
  AI_POLICY,
  aiPolicyByRepo,
  aiPolicyDescription,
  aiPolicyTitle,
  groupByStance,
  MAX_SUMMARY_WORDS,
  namedProjects,
  parseAiPolicy,
  policyAsks,
  repoKey,
  STANCES,
  stanceCounts,
} from "../lib/ai-policy";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, pageTitle } from "../lib/utils/page-title";

type CensusRepo = { host: string; owner: string; name: string; branch: string };
const census = JSON.parse(readFileSync(new URL("../data/file-census.json", import.meta.url), "utf8")) as {
  repos: CensusRepo[];
};
const censusByKey = new Map(census.repos.map((r) => [repoKey(r), r]));

describe("data/ai-policy.json", () => {
  it("has the documented shape", () => {
    assert.match(AI_POLICY.checked, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(AI_POLICY.source, "data/file-census.json");
    assert.ok(AI_POLICY.policies.length > 0);
    for (const p of AI_POLICY.policies) {
      for (const k of ["host", "owner", "name", "summary", "url", "path"] as const) {
        assert.equal(typeof p[k], "string", `${p.owner}/${p.name}.${k}`);
      }
    }
  });

  it("counts scanned repos the way the census does", () => {
    assert.equal(AI_POLICY.scanned, census.repos.filter((r) => r.host === "github").length);
  });

  it("uses only known stances", () => {
    for (const p of AI_POLICY.policies) assert.ok(STANCES.includes(p.stance), `${p.owner}/${p.name}`);
  });

  it(`keeps every summary to ${MAX_SUMMARY_WORDS} words`, () => {
    for (const p of AI_POLICY.policies) {
      const words = p.summary.trim().split(/\s+/).length;
      assert.ok(words <= MAX_SUMMARY_WORDS, `${p.owner}/${p.name}: ${words} words`);
      assert.ok(!/["“”]/.test(p.summary), `${p.owner}/${p.name}: summaries paraphrase, never quote`);
    }
  });

  it("lists only repos from the census, once each, sorted", () => {
    const keys = AI_POLICY.policies.map(repoKey);
    assert.equal(new Set(keys).size, keys.length);
    for (const k of keys) assert.ok(censusByKey.has(k), `${k} not in census`);
    const order = AI_POLICY.policies.map((p) => `${p.owner}/${p.name}`.toLowerCase());
    assert.deepEqual(
      order,
      [...order].sort((a, b) => a.localeCompare(b)),
    );
  });

  it("links each policy to a file in that repo on its census branch", () => {
    for (const p of AI_POLICY.policies) {
      const r = censusByKey.get(repoKey(p));
      assert.ok(r);
      assert.ok(
        p.url.startsWith(`https://github.com/${r.owner}/${r.name}/blob/${r.branch}/${p.path}`),
        `${p.owner}/${p.name}: ${p.url}`,
      );
    }
  });
});

describe("parseAiPolicy", () => {
  it("rejects an unknown stance", () => {
    const bad = { ...raw, policies: [{ ...raw.policies[0], stance: "maybe" }] };
    assert.throws(() => parseAiPolicy(bad), /bad stance/);
  });

  it("rejects a missing flag", () => {
    const { disclosure: _, ...rest } = raw.policies[0];
    assert.throws(() => parseAiPolicy({ ...raw, policies: [rest] }), /disclosure missing/);
  });
});

describe("aggregation", () => {
  it("counts every policy under exactly one stance", () => {
    const c = stanceCounts(AI_POLICY.policies);
    assert.equal(
      STANCES.reduce((n, s) => n + c[s], 0),
      AI_POLICY.policies.length,
    );
    const grouped = groupByStance(AI_POLICY.policies);
    assert.equal(
      grouped.reduce((n, g) => n + g.policies.length, 0),
      AI_POLICY.policies.length,
    );
    assert.deepEqual(
      grouped.map((g) => g.stance),
      STANCES.filter((s) => c[s] > 0),
    );
  });

  it("derives the asks from the flags", () => {
    const a = policyAsks(AI_POLICY.policies);
    assert.equal(a.total, AI_POLICY.policies.length);
    assert.equal(a.disclosure, AI_POLICY.policies.filter((p) => p.disclosure).length);
  });

  it("maps repos by lowercased host/owner/name", () => {
    const map = aiPolicyByRepo();
    assert.equal(map.size, AI_POLICY.policies.length);
    const p = AI_POLICY.policies[0];
    assert.deepEqual(map.get(`${p.host}/${p.owner}/${p.name}`.toLowerCase()), { stance: p.stance, url: p.url });
  });

  it("names only census repos", () => {
    for (const n of namedProjects()) assert.ok(censusByKey.has(repoKey(n)), n.label);
  });
});

describe("page copy", () => {
  it("fits the title and description caps", () => {
    assert.ok(pageTitle(aiPolicyTitle()).absolute.length <= MAX_TITLE_LENGTH);
    assert.ok(aiPolicyDescription().length <= MAX_DESCRIPTION_LENGTH, aiPolicyDescription());
  });
});

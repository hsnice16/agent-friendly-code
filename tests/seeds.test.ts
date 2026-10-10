import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import {
  bitbucketFlags,
  FINDING_KINDS,
  freshnessFindings,
  githubFlags,
  gitlabFlags,
  localFindings,
  partitionAccepted,
  STALE_AFTER_SECONDS,
  seedTargets,
} from "../lib/seeds";
import { SEEDS } from "../scripts/seed-list";

const react = { host: "github", owner: "facebook", name: "react" };
const kinds = (flags: { kind: string }[]) => flags.map((f) => f.kind);

describe("seedTargets", () => {
  test("canonicalises the URL and parses former names", () => {
    const [t] = seedTargets([
      { url: "https://github.com/react/react.git", was: ["https://github.com/facebook/react"] },
    ]);

    assert.equal(t.url, "https://github.com/react/react");
    assert.deepEqual(
      t.was.map((w) => `${w.owner}/${w.name}`),
      ["facebook/react"],
    );
  });

  test("throws instead of returning a list the prune would act on", () => {
    assert.throws(() => seedTargets([]), /no seeds/);
    assert.throws(() => seedTargets([{ url: "https://example.com/a/b" }]), /unusable/);
    assert.throws(
      () => seedTargets([{ url: "https://github.com/a/b" }, { url: "https://github.com/A/B" }]),
      /same repo as/,
    );
    assert.throws(() => seedTargets([{ url: "https://github.com/a/b", was: ["nope"] }]), /unparseable former URL/);
    assert.throws(
      () =>
        seedTargets([
          { url: "https://github.com/a/b", was: ["https://github.com/c/d"] },
          { url: "https://github.com/C/D" },
        ]),
      /is the seed/,
    );
  });

  test("the shipped seed list is usable and only accepts known finding kinds", () => {
    assert.equal(seedTargets(SEEDS).length, SEEDS.length);
    assert.deepEqual(localFindings(SEEDS), []);

    for (const s of SEEDS) {
      for (const k of s.accept ?? []) assert.ok(FINDING_KINDS.includes(k), `${s.url}: ${k}`);
    }
  });
});

describe("host API classification", () => {
  test("GitHub: 404 is gone or private", () => {
    assert.deepEqual(kinds(githubFlags(react, 404, null)), ["missing-or-private"]);
    assert.deepEqual(githubFlags(react, 500, null), [{ kind: "http-error", detail: "HTTP 500" }]);
  });

  test("GitHub: a redirected lookup reports the new name", () => {
    assert.deepEqual(githubFlags(react, 200, { full_name: "react/react", size: 1 }), [
      { kind: "renamed", detail: "now react/react" },
    ]);
    assert.deepEqual(githubFlags(react, 200, { full_name: "Facebook/React", size: 1 }), []);
  });

  test("GitHub: archived, fork, mirror, empty", () => {
    const flags = githubFlags(react, 200, {
      size: 0,
      fork: true,
      archived: true,
      full_name: "facebook/react",
      parent: { full_name: "up/stream" },
      mirror_url: "https://example.com/x.git",
    });

    assert.deepEqual(kinds(flags), ["fork", "mirror", "archived", "empty"]);
  });

  test("GitLab: moved path, non-public visibility", () => {
    const p = { host: "gitlab", owner: "group/sub", name: "proj" };

    assert.deepEqual(kinds(gitlabFlags(p, 404, null)), ["missing-or-private"]);
    assert.deepEqual(gitlabFlags(p, 200, { path_with_namespace: "group/sub/proj", visibility: "public" }), []);
    assert.deepEqual(kinds(gitlabFlags(p, 200, { path_with_namespace: "other/proj", visibility: "internal" })), [
      "renamed",
      "private",
    ]);
  });

  test("Bitbucket: renamed, private, fork", () => {
    const p = { host: "bitbucket", owner: "team", name: "repo" };

    assert.deepEqual(kinds(bitbucketFlags(p, 404, null)), ["missing-or-private"]);
    assert.deepEqual(
      kinds(bitbucketFlags(p, 200, { full_name: "team/renamed", is_private: true, parent: { full_name: "a/b" } })),
      ["renamed", "fork", "private"],
    );
  });
});

describe("freshnessFindings", () => {
  const now = 1_800_000_000;
  const seeds = [
    { url: "https://github.com/a/fresh" },
    { url: "https://github.com/a/stuck" },
    { url: "https://github.com/a/never" },
    { url: "https://github.com/new/name", was: ["https://github.com/old/name"] },
  ];

  test("flags rows left behind by the newest run, and seeds with no row", () => {
    const findings = freshnessFindings(
      seeds,
      [
        { url: "https://github.com/a/fresh", lastScoredAt: now - 60 },
        { url: "https://github.com/A/Stuck", lastScoredAt: now - STALE_AFTER_SECONDS - 3600 },
        { url: "https://github.com/old/name", lastScoredAt: now - 60 },
      ],
      now,
    );

    assert.deepEqual(
      findings.map((f) => `${f.url} ${f.kind}`),
      ["https://github.com/a/stuck stale-score", "https://github.com/a/never unscored"],
    );
  });

  test("a database nobody has refreshed is one finding, not one per row", () => {
    const old = now - 3 * STALE_AFTER_SECONDS;
    const findings = freshnessFindings(
      seeds.slice(0, 2),
      [
        { url: "https://github.com/a/fresh", lastScoredAt: old },
        { url: "https://github.com/a/stuck", lastScoredAt: old - 60 },
      ],
      now,
    );

    assert.deepEqual(
      findings.map((f) => f.kind),
      ["rescore-stalled"],
    );
  });
});

describe("partitionAccepted", () => {
  test("an accepted kind is set aside for that seed only", () => {
    const seeds = [
      { url: "https://github.com/minio/minio", accept: ["archived" as const] },
      { url: "https://github.com/a/b" },
    ];

    const { open, accepted } = partitionAccepted(seeds, [
      { url: "https://github.com/minio/minio", kind: "archived" },
      { url: "https://github.com/minio/minio", kind: "renamed" },
      { url: "https://github.com/a/b", kind: "archived" },
    ]);

    assert.deepEqual(
      accepted.map((f) => f.url),
      ["https://github.com/minio/minio"],
    );
    assert.deepEqual(
      open.map((f) => `${f.url} ${f.kind}`),
      ["https://github.com/minio/minio renamed", "https://github.com/a/b archived"],
    );
  });
});

import "./_next-cache";

import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { cachedLiveScore } from "../lib/live-score/cached";
import { TooLargeError } from "../lib/live-score/hosts";
import type { ParsedRepo } from "../lib/repo-url";
import { cacheStore as store } from "./_next-cache";

const realFetch = globalThis.fetch;
beforeEach(() => store.clear());
afterEach(() => {
  globalThis.fetch = realFetch;
});

const repo = (owner: string, name: string): ParsedRepo =>
  ({ host: "github", owner, name, cloneUrl: "", canonicalUrl: "" }) as ParsedRepo;

// A public repo whose truncated root has more subtrees than listTree will walk.
function serveTooLarge(): string[] {
  const calls: string[] = [];
  globalThis.fetch = (async (input: string | URL) => {
    const url = String(input);
    calls.push(url);
    if (/\/repos\/[^/]+\/[^/]+$/.test(url)) return Response.json({ private: false, topics: [] });
    if (url.includes("/commits/HEAD")) return Response.json({ sha: "abc" });
    if (url.endsWith("?recursive=1")) return Response.json({ truncated: true, tree: [] });
    const tree = Array.from({ length: 501 }, (_, i) => ({ path: `d${i}`, type: "tree", mode: "040000", sha: `s${i}` }));
    return Response.json({ tree });
  }) as typeof fetch;
  return calls;
}

describe("cachedLiveScore", () => {
  it("caches too-large and re-throws it without calling the host again", async () => {
    const calls = serveTooLarge();
    await assert.rejects(cachedLiveScore(repo("o", "big")), TooLargeError);
    const first = calls.length;
    assert.ok(first > 0);
    await assert.rejects(cachedLiveScore(repo("o", "big")), TooLargeError);
    assert.equal(calls.length, first);
  });

  it("shares one entry across owner/name casing", async () => {
    const calls = serveTooLarge();
    await assert.rejects(cachedLiveScore(repo("o", "big")), TooLargeError);
    const first = calls.length;
    await assert.rejects(cachedLiveScore(repo("O", "BIG")), TooLargeError);
    assert.equal(calls.length, first);
  });

  it("does not cache a transient failure", async () => {
    const calls: string[] = [];
    globalThis.fetch = (async (input: string | URL) => {
      calls.push(String(input));
      throw new TypeError("fetch failed");
    }) as typeof fetch;
    await assert.rejects(cachedLiveScore(repo("o", "flaky")));
    const first = calls.length;
    await assert.rejects(cachedLiveScore(repo("o", "flaky")));
    assert.ok(calls.length > first);
    assert.equal(store.size, 0);
  });
});

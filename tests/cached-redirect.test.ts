import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { cachedRedirect, notFoundPage } from "../lib/utils/cached-redirect";
import { APP_URL } from "../lib/version";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function stubFetch(impl: (url: URL) => Promise<Response>): URL[] {
  const calls: URL[] = [];
  globalThis.fetch = (async (input: URL) => {
    calls.push(input);
    return impl(input);
  }) as typeof fetch;
  return calls;
}

describe("cachedRedirect", () => {
  it("308s to the path, carrying the query and a CDN cache lifetime", () => {
    const res = cachedRedirect("/repo/github/o/r", new Request("https://x.test/repo/7?model=devin&a=1&a=2"));
    assert.equal(res.status, 308);
    assert.equal(res.headers.get("Location"), "/repo/github/o/r?model=devin&a=1&a=2");
    assert.match(res.headers.get("Cache-Control") ?? "", /s-maxage=\d+/);
  });

  it("adds nothing when there is no query", () => {
    const res = cachedRedirect("/repo/github/o/r", new Request("https://x.test/repo/7"));
    assert.equal(res.headers.get("Location"), "/repo/github/o/r");
  });
});

describe("notFoundPage", () => {
  it("serves the site's not-found HTML as a cacheable 404, fetched from APP_URL", async () => {
    const calls = stubFetch(
      async () => new Response("<html>Live Score</html>", { headers: { "Content-Type": "text/html; charset=utf-8" } }),
    );
    const res = await notFoundPage();

    assert.equal(res.status, 404);
    assert.equal(await res.text(), "<html>Live Score</html>");
    assert.match(res.headers.get("Cache-Control") ?? "", /s-maxage=\d+/);
    assert.equal(calls[0]?.href, new URL("/_not-found", APP_URL).href);
  });

  it("accepts the page sent with a 404, as `next start` sends it", async () => {
    stubFetch(
      async () => new Response("<html>Live Score</html>", { status: 404, headers: { "Content-Type": "text/html" } }),
    );
    const res = await notFoundPage();

    assert.equal(res.status, 404);
    assert.equal(await res.text(), "<html>Live Score</html>");
  });

  it("falls back to a bare, uncached 404 when the fetch fails", async () => {
    stubFetch(async () => {
      throw new TypeError("fetch failed");
    });
    const res = await notFoundPage();

    assert.equal(res.status, 404);
    assert.equal(res.headers.get("Cache-Control"), null);
  });

  it("does not pass on an error page or a non-HTML body", async () => {
    for (const page of [
      new Response("boom", { status: 500, headers: { "Content-Type": "text/html" } }),
      new Response("{}", { headers: { "Content-Type": "application/json" } }),
    ]) {
      stubFetch(async () => page);
      const res = await notFoundPage();

      assert.equal(res.status, 404);
      assert.equal(await res.text(), "Not found");
    }
  });
});

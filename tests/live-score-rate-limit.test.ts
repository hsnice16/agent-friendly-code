import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, afterEach, describe, it } from "node:test";

import { listTree, RateLimitedError } from "../lib/live-score/hosts";
import { materialize } from "../lib/live-score/materialize";

const base = mkdtempSync(join(tmpdir(), "afc-rl-"));
after(() => rmSync(base, { recursive: true, force: true }));

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

// First matching pattern wins; anything unmatched is a 404.
function route(table: [RegExp, () => Response][]) {
  globalThis.fetch = (async (input: string | URL) => {
    const url = String(input);
    for (const [pattern, reply] of table) if (pattern.test(url)) return reply();
    return new Response("nf", { status: 404 });
  }) as typeof fetch;
}

const status = (code: number) => () => new Response("", { status: code });
const dir = { path: "src", type: "tree", mode: "040000", sha: "s1" };
const readme = { path: "README.md", type: "blob", mode: "100644", sha: "r1" };

describe("a spent quota surfaces as RateLimitedError, never as a missing tree or file", () => {
  for (const code of [403, 429]) {
    it(`GitHub tree listing (${code})`, async () => {
      route([[/git\/trees/, status(code)]]);
      await assert.rejects(listTree("github", "o", "n", "abc"), RateLimitedError);
    });

    it(`GitHub truncated-tree root (${code})`, async () => {
      route([
        [/\?recursive=1$/, () => Response.json({ truncated: true, tree: [] })],
        [/git\/trees\/abc$/, status(code)],
      ]);
      await assert.rejects(listTree("github", "o", "n", "abc"), RateLimitedError);
    });

    it(`GitHub truncated-tree subtree (${code})`, async () => {
      route([
        [/trees\/abc\?recursive=1$/, () => Response.json({ truncated: true, tree: [] })],
        [/git\/trees\/abc$/, () => Response.json({ tree: [dir] })],
        [/git\/trees\/s1/, status(code)],
      ]);
      await assert.rejects(listTree("github", "o", "n", "abc"), RateLimitedError);
    });

    it(`GitLab pagination (${code})`, async () => {
      route([[/gitlab\.com/, status(code)]]);
      await assert.rejects(listTree("gitlab", "o", "n", "abc"), RateLimitedError);
    });

    it(`content fetch during materialize (${code})`, async () => {
      route([
        [/git\/trees\/abc/, () => Response.json({ truncated: false, tree: [readme] })],
        [/raw\.githubusercontent\.com/, status(code)],
      ]);
      await assert.rejects(materialize("github", "o", "n", "abc", join(base, `m${code}`)), RateLimitedError);
    });
  }

  it("a 404 tree stays a plain error", async () => {
    route([]);
    await assert.rejects(listTree("github", "o", "n", "abc"), (err) => !(err instanceof RateLimitedError));
  });
});

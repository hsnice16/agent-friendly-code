import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { normalizeToRepoUrl, resolvePackageToRepo } from "../lib/clients/registries";

const realFetch = globalThis.fetch;

function serve(body: unknown): void {
  globalThis.fetch = (async () => Response.json(body)) as unknown as typeof fetch;
}

const slug = (p: { host: string; owner: string; name: string } | null) => p && `${p.host}/${p.owner}/${p.name}`;

describe("normalizeToRepoUrl", () => {
  test("reads the URL forms package manifests use", () => {
    for (const raw of [
      "git+https://github.com/expressjs/express.git",
      "git://github.com/expressjs/express.git",
      "ssh://git@github.com/expressjs/express.git",
      "git@github.com:expressjs/express.git",
      "https://github.com/expressjs/express",
    ]) {
      assert.equal(slug(normalizeToRepoUrl(raw)), "github/expressjs/express", raw);
    }
  });

  test("anything but a string is no repo", () => {
    assert.equal(normalizeToRepoUrl({ url: "https://github.com/a/b" }), null);
    assert.equal(normalizeToRepoUrl(undefined), null);
  });
});

describe("resolvePackageToRepo", () => {
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  test("npm: repository as a string or an object", async () => {
    serve({ repository: "git+https://github.com/a/b.git" });
    assert.equal(slug(await resolvePackageToRepo("npm", "b")), "github/a/b");
    serve({ repository: { type: "git", url: "git+https://github.com/a/c.git" } });
    assert.equal(slug(await resolvePackageToRepo("npm", "c")), "github/a/c");
  });

  test("PyPI: the source link wins over a docs homepage, whatever its key's casing", async () => {
    serve({
      info: {
        home_page: "https://docs.example.com",
        project_urls: { Homepage: "https://example.com", "Source Code": "https://github.com/a/b" },
      },
    });
    assert.equal(slug(await resolvePackageToRepo("pypi", "b")), "github/a/b");
  });

  test("PyPI: falls back to any link that is a repo", async () => {
    serve({ info: { project_urls: { Tracker: "https://gitlab.com/g/sub/p/-/issues" } } });
    assert.equal(slug(await resolvePackageToRepo("pypi", "p")), "gitlab/g/sub/p");
  });

  test("a malformed body resolves to nothing instead of throwing", async () => {
    serve({ crate: { repository: 42 } });
    assert.equal(await resolvePackageToRepo("cargo", "x"), null);
    serve([1, 2]);
    assert.equal(await resolvePackageToRepo("npm", "x"), null);
  });
});

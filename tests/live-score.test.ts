import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import { CONTENT_CANDIDATES } from "../lib/live-score/content-files";
import { blobUrl, RateLimitedError, rawUrl, resolveCommit } from "../lib/live-score/hosts";
import { safeAbsolute } from "../lib/live-score/materialize";
import { SUPPORTED_HOSTS } from "../lib/live-score/supported";

const SIGNALS_DIR = join(process.cwd(), "lib", "scoring", "signals");

describe("content candidates", () => {
  // The live path fetches bytes only for these paths. A signal that reads a file
  // absent from the list scores it as empty — silently, with no error — so the
  // list has to stay ahead of the signals rather than behind them.
  it("covers every candidate list belonging to a content-reading signal", () => {
    const lower = new Set(CONTENT_CANDIDATES.map((c) => c.toLowerCase()));

    const readers: Record<string, string[]> = {
      "readme.ts": ["README.md", "README.rst", "README.txt", "README"],
      "agents-md.ts": ["AGENTS.md", "CLAUDE.md", "AGENT.md"],
      "gemini-md.ts": ["GEMINI.md"],
      "openhands-setup.ts": [".openhands/setup.sh"],
      "dev-env.ts": ["package.json"],
      "linter.ts": ["pyproject.toml"],
      "type-config.ts": ["pyproject.toml"],
      "size.ts": [".gitignore"],
    };

    for (const [file, paths] of Object.entries(readers)) {
      const source = readFileSync(join(SIGNALS_DIR, file), "utf8");
      assert.match(source, /readSafe|readFileSync/, `${file} is expected to read file contents`);

      for (const path of paths) {
        assert.ok(lower.has(path.toLowerCase()), `${file} reads ${path}, missing from CONTENT_CANDIDATES`);
      }
    }
  });

  it("matches case-insensitively, since firstExisting does", () => {
    // expressjs/express spells it Readme.md; an exact-match allowlist scored it 0.
    const lower = CONTENT_CANDIDATES.map((c) => c.toLowerCase());
    assert.ok(lower.includes("readme.md"));
    assert.equal(new Set(lower).size, lower.length, "duplicate candidates differing only by case");
  });
});

describe("host URLs", () => {
  it("encodes GitLab subgroups into the project id", () => {
    const url = rawUrl("gitlab", "group/sub", "project", "abc123", "README.md");
    assert.ok(url.includes("group%2Fsub%2Fproject"), url);
  });

  it("offers a blob fallback only where the host has one", () => {
    assert.ok(blobUrl("github", "o", "n", "sha"));
    assert.ok(blobUrl("gitlab", "o", "n", "sha"));
    assert.equal(blobUrl("bitbucket", "o", "n", "sha"), null);
  });
});

describe("resolveCommit", () => {
  const realFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  const respond = (status: number, body: unknown = {}) => {
    globalThis.fetch = (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
  };

  it("returns the sha on success", async () => {
    respond(200, { sha: "abc" });
    assert.equal(await resolveCommit("github", "o", "n", "HEAD"), "abc");
  });

  it("returns null only when the repo is missing or empty", async () => {
    respond(404);
    assert.equal(await resolveCommit("github", "o", "n", "HEAD"), null);
    respond(409);
    assert.equal(await resolveCommit("github", "o", "n", "HEAD"), null);
  });

  it("throws on a rejected token instead of reporting the repo missing", async () => {
    respond(401);
    await assert.rejects(resolveCommit("github", "o", "n", "HEAD", "stale"));
  });

  it("throws RateLimitedError on a spent quota", async () => {
    respond(403);
    await assert.rejects(resolveCommit("github", "o", "n", "HEAD"), RateLimitedError);
  });
});

describe("supported hosts", () => {
  it("ships GitHub only until GitLab pagination and Bitbucket rate limits are guarded", () => {
    assert.deepEqual(SUPPORTED_HOSTS, ["github"]);
  });
});

describe("path safety", () => {
  const dest = "/tmp/afc-dest";

  it("accepts ordinary repo paths", () => {
    assert.equal(safeAbsolute(dest, "src/index.ts"), `${dest}/src/index.ts`);
    assert.equal(safeAbsolute(dest, ".github/workflows/ci.yml"), `${dest}/.github/workflows/ci.yml`);
  });

  it("rejects traversal and absolute paths", () => {
    for (const hostile of ["../evil", "a/../../evil", "/etc/passwd", ".."]) {
      assert.equal(safeAbsolute(dest, hostile), null, `${hostile} should be rejected`);
    }
  });

  it("rejects an empty path", () => {
    assert.equal(safeAbsolute(dest, ""), null);
  });
});

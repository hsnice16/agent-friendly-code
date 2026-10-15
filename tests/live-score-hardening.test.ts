import "./_temp-db";

import assert from "node:assert/strict";
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, afterEach, describe, it } from "node:test";

import { listTree, TooLargeError } from "../lib/live-score/hosts";
import { materialize } from "../lib/live-score/materialize";
import { liveScore } from "../lib/live-score/score";
import { isValidPackageName } from "../lib/package-lookup";

const base = mkdtempSync(join(tmpdir(), "afc-mat-"));
after(() => rmSync(base, { recursive: true, force: true }));

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

type Node = { path: string; type: string; mode: string; sha: string };
const link = (path: string, sha = path): Node => ({ path, type: "blob", mode: "120000", sha });
const file = (path: string): Node => ({ path, type: "blob", mode: "100644", sha: path });

// Raw 404s for every link, so each target comes from its blob, as a dangling one does.
function serve(tree: Node[], blobs: Record<string, string>, raw: Record<string, string> = {}, calls: string[] = []) {
  globalThis.fetch = (async (input: string | URL) => {
    const url = String(input);
    calls.push(url);
    if (url.endsWith("/repos/o/n")) return Response.json({ private: false, description: null, topics: [] });
    if (url.endsWith("/repos/o/p")) return Response.json({ private: true });
    if (url.includes("/commits/HEAD")) return Response.json({ sha: "abc" });
    if (url.includes("/git/trees/abc")) return Response.json({ truncated: false, tree });
    const blob = url.match(/\/git\/blobs\/(.+)$/);
    if (blob && decodeURIComponent(blob[1]) in blobs) return new Response(blobs[decodeURIComponent(blob[1])]);
    const path = url.match(/\/abc\/(.+)$/);
    if (path && decodeURIComponent(path[1]) in raw) return new Response(raw[decodeURIComponent(path[1])]);
    return new Response("nf", { status: 404 });
  }) as typeof fetch;
}

let n = 0;
const dest = () => join(base, `d${n++}`);

describe("materialize keeps links inside the tree", () => {
  it("leaves a placeholder for absolute, ../ and root-level targets", async () => {
    const victimDir = join(base, "victim");
    mkdirSync(victimDir);
    const victim = join(victimDir, "victim.txt");
    writeFileSync(victim, "original");

    serve(
      [link("README.md"), link("AGENTS.md"), link("zero"), link("up"), file("ok.md"), link("in.md")],
      {
        "README.md": victim,
        "AGENTS.md": "../victim/victim.txt",
        zero: "/dev/zero",
        up: ".",
        "in.md": "ok.md",
      },
      { "../victim/victim.txt": "ATTACKER", "ok.md": "fine" },
    );

    const dir = dest();
    await materialize("github", "o", "n", "abc", dir);

    for (const p of ["README.md", "AGENTS.md", "zero", "up"]) {
      assert.ok(lstatSync(join(dir, p)).isFile(), `${p} should be a placeholder`);
      assert.equal(readFileSync(join(dir, p), "utf8"), "");
    }
    assert.equal(readlinkSync(join(dir, "in.md")), "ok.md");
    assert.equal(readFileSync(victim, "utf8"), "original");
  });

  it("caps blob lookups for dangling links", async () => {
    const calls: string[] = [];
    const tree = Array.from({ length: 300 }, (_, i) => link(`l${i}`));
    serve(tree, {}, {}, calls);
    await materialize("github", "o", "n", "abc", dest());
    assert.equal(calls.filter((u) => u.includes("/git/blobs/")).length, 200);
  });

  it("encodes path segments in raw URLs", async () => {
    const calls: string[] = [];
    serve([file("README.md")], {}, {}, calls);
    await materialize("github", "o", "n", "abc", dest());
    assert.ok(calls.includes("https://raw.githubusercontent.com/o/n/abc/README.md"));
  });
});

describe("truncated GitHub trees", () => {
  it("refuses a root with too many subtrees instead of one call per directory", async () => {
    const calls: string[] = [];
    globalThis.fetch = (async (input: string | URL) => {
      const url = String(input);
      calls.push(url);
      if (url.endsWith("?recursive=1")) return Response.json({ truncated: true, tree: [] });
      const dirs = Array.from({ length: 501 }, (_, i) => ({
        path: `d${i}`,
        type: "tree",
        mode: "040000",
        sha: `s${i}`,
      }));
      return Response.json({ tree: dirs });
    }) as typeof fetch;
    await assert.rejects(listTree("github", "o", "n", "abc"), TooLargeError);
    assert.equal(calls.length, 2);
  });
});

describe("liveScore", () => {
  it("returns null for a private repo without listing its tree", async () => {
    const calls: string[] = [];
    serve([file("README.md")], {}, {}, calls);
    assert.equal(await liveScore({ host: "github", owner: "o", name: "p", cloneUrl: "", canonicalUrl: "" }), null);
    assert.ok(!calls.some((u) => u.includes("/git/trees/")));
  });

  it("throws rather than scoring when visibility is unknown", async () => {
    serve([file("README.md")], {});
    await assert.rejects(liveScore({ host: "github", owner: "o", name: "unknown", cloneUrl: "", canonicalUrl: "" }));
  });

  it("scores a public repo", async () => {
    serve([file("README.md")], {}, { "README.md": "hello" });
    const r = await liveScore({ host: "github", owner: "o", name: "n", cloneUrl: "", canonicalUrl: "" });
    assert.equal(r?.signals.find((s) => s.id === "readme")?.detail, "README thin (5 characters)");
  });
});

describe("package names", () => {
  it("accepts real names and rejects what no registry allows", () => {
    assert.ok(isValidPackageName("npm", "@types/node"));
    assert.ok(isValidPackageName("npm", "JSONStream"));
    assert.ok(isValidPackageName("pypi", "zope.interface"));
    assert.ok(isValidPackageName("cargo", "serde_json"));
    assert.ok(!isValidPackageName("npm", "a".repeat(215)));
    assert.ok(!isValidPackageName("cargo", `a${"b".repeat(64)}`));
    assert.ok(!isValidPackageName("pypi", "-bad"));
    assert.ok(!isValidPackageName("npm", "../etc"));
  });
});

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, test } from "node:test";

import { fetchRepoMeta, parseRepoUrl } from "../lib/clients/github";

// Trimmed recorded responses (axios/axios, inkscape/inkscape, snakeyaml/snakeyaml).
const fixture = (host: string) =>
  JSON.parse(readFileSync(join(__dirname, "fixtures", "repo-meta", `${host}.json`), "utf8"));

const realFetch = globalThis.fetch;

function serve(routes: Record<string, unknown>): void {
  globalThis.fetch = (async (input: string | URL) => {
    const url = String(input);
    const hit = Object.keys(routes).find((k) => url.endsWith(k));
    return hit ? Response.json(routes[hit]) : new Response("not found", { status: 404 });
  }) as typeof fetch;
}

const meta = (url: string) => fetchRepoMeta(parseRepoUrl(url)!);

describe("fetchRepoMeta description and topics", () => {
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  test("GitHub: description and topics from the repo call", async () => {
    serve({ "/repos/axios/axios": fixture("github") });
    const m = await meta("https://github.com/axios/axios");
    assert.equal(m?.description, "Promise based HTTP client for the browser and node.js");
    assert.deepEqual(m?.topics, ["hacktoberfest", "http-client", "javascript", "nodejs", "promise"]);
    assert.equal(m?.stars, 109301);
  });

  test("GitHub: shortcodes stripped, a null description and missing topics read as empty", async () => {
    serve({ "/repos/o/r": { ...fixture("github"), description: ":rocket: Fast\tthing  :zap:", topics: undefined } });
    assert.deepEqual(await meta("https://github.com/o/r").then((m) => [m?.description, m?.topics]), ["Fast thing", []]);

    serve({ "/repos/o/r": { ...fixture("github"), description: null } });
    assert.equal((await meta("https://github.com/o/r"))?.description, null);
  });

  test("GitLab: topics lowercased; tag_list read on older versions", async () => {
    const project = fixture("gitlab");
    serve({ "inkscape%2Finkscape": project, "/languages": { "C++": 80 } });
    const m = await meta("https://gitlab.com/inkscape/inkscape");
    assert.equal(m?.description, "Inkscape vector image editor");
    assert.deepEqual(m?.topics, ["c++", "gtk4", "gtkmm", "hacktoberfest", "svg", "vectorgraphics"]);

    serve({ "inkscape%2Finkscape": { ...project, topics: undefined }, "/languages": {} });
    assert.equal((await meta("https://gitlab.com/inkscape/inkscape"))?.topics.length, 6);
  });

  test("Bitbucket: description, never topics", async () => {
    serve({ "/repositories/snakeyaml/snakeyaml": fixture("bitbucket") });
    const m = await meta("https://bitbucket.org/snakeyaml/snakeyaml");
    assert.equal(m?.description, "a complete YAML 1.1 processor for JVM");
    assert.deepEqual(m?.topics, []);
  });

  test("a failed call is null, so the stored values are kept", async () => {
    serve({});
    assert.equal(await meta("https://github.com/o/r"), null);
  });
});

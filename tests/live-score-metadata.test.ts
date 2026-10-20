import "./_temp-db";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { generateMetadata } from "../app/score/[host]/[owner]/[name]/page";

const meta = (host: string, owner: string, name: string) =>
  generateMetadata({ params: Promise.resolve({ host, owner, name }) });

describe("live score metadata", () => {
  it("builds title and canonical for a valid slug", async () => {
    const m = await meta("github", "honojs", "hono");
    assert.equal(m.title, "honojs/hono — Live Score");
    assert.equal(m.alternates?.canonical, "/score/github/honojs/hono");
  });

  it("echoes nothing from a slug the page would 404", async () => {
    for (const [host, owner, name] of [
      ["github", "<script>", "x"],
      ["github", "..", "x"],
      ["github", "o", "a b"],
      ["nohost", "o", "n"],
    ]) {
      assert.deepEqual(await meta(host, owner, name), {}, `${host}/${owner}/${name}`);
    }
  });
});

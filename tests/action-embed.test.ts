import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { yamlBranch } from "../components/ActionEmbed";

describe("yamlBranch", () => {
  it("leaves ordinary branch names bare", () => {
    assert.equal(yamlBranch("main"), "main");
    assert.equal(yamlBranch("release/v1.2_x-y"), "release/v1.2_x-y");
  });

  it("quotes names that would split or break the flow sequence", () => {
    for (const branch of ["a,b", "x]", "{y}", 'q"r', "it's", "#tag", "&anchor", "$x"]) {
      const out = yamlBranch(branch);
      assert.ok(out.startsWith('"') && out.endsWith('"'), out);
      assert.equal(JSON.parse(out), branch);
    }
  });
});

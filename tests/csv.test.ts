import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { csvField } from "../lib/utils/csv";

describe("csvField", () => {
  it("leaves plain text and numbers alone", () => {
    assert.equal(csvField("axios/axios"), "axios/axios");
    assert.equal(csvField(42), "42");
    assert.equal(csvField(-3), "-3");
    assert.equal(csvField(null), "");
  });

  it("quotes commas, quotes and newlines", () => {
    assert.equal(csvField('a,"b"'), '"a,""b"""');
    assert.equal(csvField("a\nb"), '"a\nb"');
  });

  it("defuses formula-leading text", () => {
    for (const lead of ["=", "+", "-", "@"]) assert.equal(csvField(`${lead}1+1`), `'${lead}1+1`);
    assert.equal(csvField('=HYPERLINK("x",1)'), '"\'=HYPERLINK(""x"",1)"');
    assert.equal(csvField("  =1+1"), "'  =1+1");
    assert.equal(csvField("a = b"), "a = b");
  });
});

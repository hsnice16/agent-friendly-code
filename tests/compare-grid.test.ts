import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CompareGrid } from "../components/CompareGrid";

test("CompareGrid labels each cell with its column for the stacked phone layout", () => {
  const html = renderToStaticMarkup(
    createElement(CompareGrid, {
      heads: ["GEMINI.md", "AGENTS.md"],
      rows: [{ aspect: "Where", a: "repo root", b: "any folder" }],
    }),
  );
  assert.match(html, /<dt[^>]*>Where<\/dt>/);
  const cells = [...html.matchAll(/<dd[^>]*><span[^>]*>(.*?)<\/span>(.*?)<\/dd>/g)].map((m) => [
    m[1].replace(/<!-- -->/g, ""),
    m[2],
  ]);
  assert.deepEqual(cells, [
    ["GEMINI.md: ", "repo root"],
    ["AGENTS.md: ", "any folder"],
  ]);
});

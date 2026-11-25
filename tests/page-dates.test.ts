import "./_temp-db";

import assert from "node:assert/strict";
import { after, describe, it } from "node:test";

import { getAgentSkillsReport } from "../lib/agent-skills-data";
import { CHECK_CONTENT } from "../lib/check-content";
import { db, saveScoredRepo } from "../lib/db";
import {
  checkModified,
  frameworkModified,
  languageExamplesModified,
  modelBoardModified,
  pageModified,
  rowsModified,
} from "../lib/page-dates";
import type { ModelScore } from "../lib/scoring/scorer";
import { MODELS } from "../lib/scoring/weights";
import { APP_URL } from "../lib/version";

after(() => db.close());

const at = (iso: string) => ({ content_changed_at: Date.parse(iso) / 1000 });
const day = (iso: string) => iso.slice(0, 10);
const DAY = /^\d{4}-\d{2}-\d{2}$/;

function save(name: string, pass: number, overall = 50) {
  const modelScores = [{ modelId: MODELS[0].id, score: overall }] as ModelScore[];
  saveScoredRepo({
    name,
    owner: "o",
    host: "github",
    language: "Go",
    overall,
    modelScores,
    url: `https://github.com/o/${name}`,
    signals: [{ id: "tests", label: "Tests", pass, detail: "" }],
    about: { description: null, topics: [] },
  });
}

describe("page dates", () => {
  it("rowsModified is the newest row's change, or null when none has one", () => {
    assert.equal(rowsModified([]), null);
    assert.equal(rowsModified([{ content_changed_at: null }]), null);
    assert.equal(
      rowsModified([at("2026-11-01T00:00:00Z"), { content_changed_at: null }, at("2026-11-20T12:00:00Z")]),
      "2026-11-20T12:00:00.000Z",
    );
  });

  it("pageModified takes the latest of the copy, its rows and any other source", () => {
    assert.equal(pageModified("2026-11-16"), "2026-11-16T00:00:00.000Z");
    assert.equal(pageModified("2026-11-16", [at("2026-01-01T00:00:00Z")], null), "2026-11-16T00:00:00.000Z");
    assert.equal(pageModified("2026-11-16", [at("2026-11-20T08:00:00Z")]), "2026-11-20T08:00:00.000Z");
    assert.equal(pageModified("2026-11-16", [], "2026-11-21"), "2026-11-21T00:00:00.000Z");
  });

  it("frameworkModified never predates the guide text", () => {
    const guide = frameworkModified({ rows: [] });
    assert.ok(Date.parse(guide) > 0);
    assert.equal(frameworkModified({ rows: [at("2020-01-01T00:00:00Z")] }), guide);
    assert.equal(frameworkModified({ rows: [at("2030-01-01T00:00:00Z")] }), "2030-01-01T00:00:00.000Z");
  });

  it("languageExamplesModified dates a guide page by its prose, a bare list by its rows", () => {
    const guide = languageExamplesModified({ rows: [], guide: {} });
    assert.ok(guide && Date.parse(guide) > 0);
    assert.equal(languageExamplesModified({ rows: [at("2020-01-01T00:00:00Z")], guide: {} }), guide);
    assert.equal(
      languageExamplesModified({ rows: [at("2030-01-01T00:00:00Z")], guide: {} }),
      "2030-01-01T00:00:00.000Z",
    );
    assert.equal(languageExamplesModified({ rows: [], guide: null }), null);
    assert.equal(
      languageExamplesModified({ rows: [at("2020-01-01T00:00:00Z")], guide: null }),
      "2020-01-01T00:00:00.000Z",
    );
  });

  it("every check has a publish date no later than its last edit", () => {
    for (const [id, c] of Object.entries(CHECK_CONTENT)) {
      assert.match(c.published, DAY, id);
      assert.match(c.updated, DAY, id);
      assert.ok(c.published <= c.updated, id);
    }
  });

  it("a check page moves with the rows it lists, not with the rest of the board", () => {
    const copy = `${CHECK_CONTENT.tests.updated}T00:00:00.000Z`;
    assert.equal(checkModified("tests"), copy);
    const boardCopy = modelBoardModified(MODELS[0].id);

    // A partial pass is in neither "passes" nor "fails", so the page shows no row of it.
    save("partial", 0.5);
    assert.equal(checkModified("tests"), copy);

    const before = new Date().toISOString();
    save("passing", 1);
    const listed = checkModified("tests");
    assert.ok(listed > copy);
    assert.ok(day(listed) >= day(before) && day(listed) <= day(new Date().toISOString()));
    assert.equal(modelBoardModified(MODELS[0].id), listed > boardCopy ? listed : boardCopy);
  });

  it("the skills check page never predates the census it shows", () => {
    assert.ok(checkModified("agent_skills") >= getAgentSkillsReport().date);
  });

  it("the sitemap dates each check and report as its page does", async () => {
    const { default: sitemap } = await import("../app/sitemap");
    const { checkPath } = await import("../lib/utils/check-path");
    const { SKILLS_REPORT_PATH } = await import("../lib/utils/report-path");
    const lastmod = new Map(sitemap().map((e) => [e.url, e.lastModified]));
    const iso = (url: string) => {
      const d = lastmod.get(url);
      return d ? new Date(d).toISOString() : undefined;
    };

    assert.equal(iso(`${APP_URL}${checkPath("tests")}`), checkModified("tests"));
    assert.equal(iso(`${APP_URL}${SKILLS_REPORT_PATH}`), new Date(getAgentSkillsReport().date).toISOString());
  });
});

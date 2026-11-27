import { getAgentSkillsReport } from "./agent-skills-data";
import { AGENT_DOCS_CHECKED } from "./agents-faq";
import { AI_POLICY } from "./ai-policy";
import { pageSlice } from "./board";
import { CHECK_CONTENT } from "./check-content";
import { VS_AGENTS_MD } from "./check-content/vs-agents-md";
import { getCheckStats } from "./check-stats";
import { getContributeList } from "./contribute-data";
import { listLeaderboard } from "./db";
import { CENSUS_SUMMARY } from "./file-census";
import { getAgentsMdExamples } from "./leaderboard-files";
import { LICENSE_CITING } from "./license-policy";
import type { ModelId } from "./scoring/weights";

/*
 * Every non-repo page's visible "Updated", JSON-LD dateModified and sitemap lastmod come from
 * here, so the three agree. A page's date is its last copy edit, or a later change to a row it
 * lists or is built from. Counts across the whole board don't move it: a rescore shifts them by
 * a repo on most days, and Google stops trusting dates that move without a real change.
 */

type Dated = { content_changed_at: number | null };

export function rowsModified(rows: Dated[]): string | null {
  const changed = Math.max(0, ...rows.map((r) => r.content_changed_at ?? 0));
  return changed > 0 ? new Date(changed * 1000).toISOString() : null;
}

/** The latest of `copy`, the newest row and any other dated source the page shows. */
export function pageModified(copy: string, rows: Dated[] = [], ...also: (string | null)[]): string {
  const dates = [copy, rowsModified(rows), ...also].flatMap((d) => (d ? [Date.parse(d)] : []));
  return new Date(Math.max(...dates)).toISOString();
}

// The last copy edit on each page; bump one with the edit.
const COPY = {
  frameworkGuides: "2026-11-16",
  languageGuides: "2026-11-16",
  examples: "2026-11-22",
  vsClaudeMd: "2026-11-27",
  vsAgentsMd: "2026-11-22",
  agents: "2026-11-27",
  sizeReport: "2026-11-22",
  contribute: "2026-11-16",
  languageHub: "2026-11-25",
  guideHub: "2026-11-25",
  modelSetup: "2026-11-25",
};

export const frameworkModified = (f: { rows: Dated[] }) => pageModified(COPY.frameworkGuides, f.rows);

// A language without a guide has no prose of its own, so only its rows date it.
export function languageExamplesModified(lang: { rows: Dated[]; guide: unknown }): string | null {
  return lang.guide ? pageModified(COPY.languageGuides, lang.rows) : rowsModified(lang.rows);
}

export function checkModified(id: string): string {
  const s = getCheckStats(id);
  const census = id === "agent_skills" ? getAgentSkillsReport().date : null;
  // The license page quotes the AI policy dataset and our reading of it.
  const policy = id === "license" ? [AI_POLICY.checked, LICENSE_CITING.read] : [];
  return pageModified(CHECK_CONTENT[id].updated, [...s.examples, ...s.missing], census, ...policy);
}

export const examplesModified = () => pageModified(COPY.examples, getAgentsMdExamples().rows);

export const sizeReportModified = () => pageModified(COPY.sizeReport, getAgentsMdExamples().rows);

// Its setups and their example repos come from the file census.
export const vsClaudeMdModified = () => pageModified(COPY.vsClaudeMd, [], CENSUS_SUMMARY.date);

// Only the GEMINI.md page quotes the census (its root symlink count).
export function vsAgentsMdModified(id: string): string {
  return pageModified(COPY.vsAgentsMd, [], VS_AGENTS_MD[id].file === "GEMINI.md" ? CENSUS_SUMMARY.date : null);
}

export function contributeModified(list = getContributeList()): string {
  return pageModified(COPY.contribute, [...list.top, ...list.languages.flatMap((l) => l.rows)]);
}

// Its agents section shows the same rows as its board, so they date both.
export const hubModified = (g: { rows: Dated[] }) => pageModified(COPY.languageHub, g.rows);

export const agentsModified = () => pageModified(COPY.agents, [], AGENT_DOCS_CHECKED);

export const guideHubModified = () => pageModified(COPY.guideHub);

/** An agent board's first page: its setup panel's copy, or a repo entering or moving on it (that row was rescored). */
export function modelBoardModified(model: ModelId): string {
  const rows = listLeaderboard({ model });
  const { startIdx, endIdx } = pageSlice(rows.length, 1);
  return pageModified(COPY.modelSetup, rows.slice(startIdx, endIdx));
}

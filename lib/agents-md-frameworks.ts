import type { AgentsMdExamples, ExampleRow } from "./agents-md-examples";
import { FRAMEWORKS } from "./framework-guides";
import type { FrameworkGuide } from "./framework-guides/types";
import { fitDescription } from "./utils/page-title";

/** Below this, the examples table is too thin to be worth a page. */
export const FRAMEWORK_EXAMPLES_MIN = 3;

export type FrameworkExamples = {
  guide: FrameworkGuide;
  rows: ExampleRow[];
  passing: number;
  /** The framework repo's own file, when it has one. */
  own: ExampleRow | null;
};

const key = (r: Pick<ExampleRow, "host" | "owner" | "name">) => `${r.host}/${r.owner}/${r.name}`.toLowerCase();

/** Frameworks with enough repos on the board whose file has content, most files first. Rows in the framework's language lead. */
export function examplesByFramework(
  ex: Pick<AgentsMdExamples, "rows">,
  frameworks: FrameworkGuide[] = FRAMEWORKS,
): FrameworkExamples[] {
  const byKey = new Map(ex.rows.map((r) => [key(r), r]));
  return frameworks
    .map((guide) => {
      const rows = guide.repos.flatMap((k) => byKey.get(k.toLowerCase()) ?? []);
      const offLanguage = (r: ExampleRow) => (guide.languages.includes(r.language ?? "") ? 0 : 1);
      rows.sort((a, b) => offLanguage(a) - offLanguage(b) || (b.stars ?? 0) - (a.stars ?? 0));
      const own = byKey.get(guide.frameworkRepo.toLowerCase()) ?? null;
      return { guide, rows, own, passing: rows.filter((r) => r.pass >= 1).length };
    })
    .filter((f) => f.rows.length >= FRAMEWORK_EXAMPLES_MIN)
    .sort((a, b) => b.rows.length - a.rows.length);
}

export function frameworkExamplesTitle(f: Pick<FrameworkExamples, "guide" | "rows">): string {
  return `AGENTS.md for ${f.guide.label}: guide and ${f.rows.length} real examples`;
}

export function frameworkExamplesDescription(f: FrameworkExamples): string {
  return fitDescription(
    `What to put in an AGENTS.md for a ${f.guide.label} ${f.guide.kind}: the commands, layout and rules agents get wrong.`,
    `Plus ${f.rows.length} real files from ${f.guide.label} repos.`,
  );
}

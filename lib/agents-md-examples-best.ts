import type { ExampleRow } from "./agents-md-examples";
import type { CensusRepo } from "./file-census-summary";
import { median } from "./utils/median";
import { repoOwnership } from "./utils/own-repo";
import { repoRawFileUrl } from "./utils/repo-file-url";

// Devin includes only the first 16 KiB, so a longer file is not one to copy whole.
const DEVIN_LIMIT = 16 * 1024;
// Under this the file passes the check but says little worth copying.
const MIN_COPYABLE = 1500;

export type BestExample = {
  row: ExampleRow;
  rawUrl: string;
  /** What the file and its setup do well, from its length and the file census. */
  notes: string[];
};

type CensusLookup = (row: Pick<ExampleRow, "host" | "owner" | "name">) => CensusRepo | undefined;

export function censusLookup(repos: CensusRepo[]): CensusLookup {
  const key = (r: { host: string; owner: string; name: string }) => `${r.host}/${r.owner}/${r.name}`.toLowerCase();
  const byKey = new Map(repos.filter((r) => !r.error).map((r) => [key(r), r]));
  return (row) => byKey.get(key(row));
}

const copyable = (r: ExampleRow) =>
  r.pass >= 1 && r.length != null && r.length >= MIN_COPYABLE && r.length <= DEVIN_LIMIT && !repoOwnership(r);

/**
 * The highest-scoring copyable file among the better-starred half, AGENTS.md before CLAUDE.md;
 * null when none qualifies.
 */
export function pickBestExample(rows: ExampleRow[], census: CensusLookup): BestExample | null {
  const named = (r: ExampleRow) => (r.file.toLowerCase() === "agents.md" ? 0 : 1);
  const pool = rows.filter(copyable);
  // A repo seeded last week can top the score with a handful of stars; nobody copies that.
  const floor = median(pool.map((r) => r.stars ?? 0)) ?? 0;
  const row = pool
    .filter((r) => (r.stars ?? 0) >= floor)
    .sort(
      (a, b) =>
        named(a) - named(b) || (b.score ?? 0) - (a.score ?? 0) || (b.stars ?? 0) - (a.stars ?? 0) || a.id - b.id,
    )
    .find((r) => repoRawFileUrl(r, r.file) != null);
  if (!row) return null;
  return { row, rawUrl: repoRawFileUrl(row, row.file) as string, notes: exampleNotes(row, census(row)) };
}

function exampleNotes(row: ExampleRow, c: CensusRepo | undefined): string[] {
  const notes: string[] = [];
  const k = (row.length ?? 0) / 1024;
  const kib = k < 10 ? k.toFixed(1) : Math.round(k);
  // Only rows under DEVIN_LIMIT are picked, which is also inside Codex's 32 KiB cap.
  notes.push(`About ${kib} KiB: inside the 16 KiB Devin reads and the 32 KiB Codex reads`);
  if (!c) return notes;

  const nested = c.agentsMd.filter((p) => p.includes("/")).length;
  if (nested > 0) {
    notes.push(`${nested} more AGENTS.md ${nested === 1 ? "file" : "files"} in subfolders, for the code below them`);
  }
  const claudeLink = c.rootLinks["CLAUDE.md"]?.split("/").pop()?.toLowerCase();
  if (row.file === "AGENTS.md" && claudeLink === "agents.md") {
    notes.push("CLAUDE.md is a symlink to it, so Claude Code reads the same file");
  } else if (row.file === "AGENTS.md" && c.claudeMdImportsAgentsMd) {
    notes.push("CLAUDE.md imports it with @AGENTS.md, so Claude Code reads it too");
  }
  const skills = c.skills.agents + c.skills.claude;
  if (skills > 0) {
    const dir = c.skills.agents >= c.skills.claude ? ".agents/skills/" : ".claude/skills/";
    notes.push(`Long task steps live in ${skills} ${skills === 1 ? "skill" : "skills"} under ${dir}, not here`);
  }
  return notes;
}

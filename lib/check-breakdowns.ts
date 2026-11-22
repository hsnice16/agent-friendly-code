import { CENSUS, type CensusRepo } from "./file-census";
import type { LeaderboardRow, SignalFile } from "./types/db";

// Keyed on the file the pre_commit signal matched, so a new candidate there lands in "other" until named here.
function hookFramework(path: string): string {
  const base = path.split("/").pop()?.toLowerCase() ?? "";
  if (base.startsWith(".pre-commit-config") || base === "prek.toml") return "pre-commit";
  if (base.startsWith(".husky")) return "Husky";
  if (base.includes("lefthook")) return "Lefthook";
  if (base === "package.json") return "package.json hooks";
  return "other";
}

/** Repos passing pre_commit, by the hook framework that passed them, largest first. */
export function hookFrameworkCounts(files: SignalFile[]): { framework: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const f of files) {
    if (f.pass < 1 || !f.matchedPath) continue;
    const k = hookFramework(f.matchedPath);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts]
    .map(([framework, count]) => ({ framework, count }))
    .sort((a, b) => (a.framework === "other" ? 1 : b.framework === "other" ? -1 : b.count - a.count));
}

type Starred = Pick<LeaderboardRow, "host" | "owner" | "name" | "stars">;

const key = (r: { host: string; owner: string; name: string }) => `${r.host}/${r.owner}/${r.name}`.toLowerCase();

const isRoot = (paths: string[], base: string) => paths.some((p) => p.toLowerCase() === base);

/** How a repo with both root files relates them, matching summarizeCensus's rootBoth split. */
function setupOf(r: CensusRepo): "import" | "symlink" | "separate" | null {
  if (!isRoot(r.agentsMd, "agents.md") || !isRoot(r.claudeMd, "claude.md")) return null;
  if (r.rootLinks["CLAUDE.md"] != null || r.rootLinks["AGENTS.md"] != null) return "symlink";
  return r.claudeMdImportsAgentsMd === true ? "import" : "separate";
}

/** The most-starred census repos using each setup; only repos still on the board, since each links to its page. */
export function setupExamples(board: Starred[], limit: number): Record<"import" | "symlink" | "separate", string[]> {
  const stars = new Map(board.map((b) => [key(b), b.stars ?? 0]));
  const starsOf = (r: CensusRepo) => stars.get(key(r)) ?? 0;
  const out = { import: [] as CensusRepo[], symlink: [] as CensusRepo[], separate: [] as CensusRepo[] };
  for (const r of CENSUS.repos) {
    const s = r.error || !stars.has(key(r)) ? null : setupOf(r);
    if (s) out[s].push(r);
  }
  const top = (rs: CensusRepo[]) =>
    rs
      .sort((a, b) => starsOf(b) - starsOf(a))
      .slice(0, limit)
      .map((r) => `${r.owner}/${r.name}`);
  return { import: top(out.import), symlink: top(out.symlink), separate: top(out.separate) };
}

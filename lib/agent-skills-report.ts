import type { AdoptionPoint } from "./agents-md-adoption";
import type { CensusRepo } from "./file-census-summary";
import type { LeaderboardRow, SignalFile } from "./types/db";
import { csvField } from "./utils/csv";
import { median } from "./utils/median";
import { fitDescription } from "./utils/page-title";
import { repoFileUrl } from "./utils/repo-file-url";
import { repoKey } from "./utils/repo-path";

export type SkillRepo = {
  host: string;
  owner: string;
  name: string;
  stars: number | null;
  agents: number;
  claude: number;
  other: number;
  /** The root `.agents/skills/` on the host, only when the scorer found it there: the census also counts nested ones. */
  agentsDirUrl: string | null;
  board: Pick<LeaderboardRow, "host" | "owner" | "name"> | null;
};

export type SkillsTrendPoint = { date: string; repos: number; count: number };

export type AgentSkillsReport = {
  date: string;
  /** GitHub trees the census read. */
  repos: number;
  /** Repos with a SKILL.md under `.agents/skills/` or `.claude/skills/`, most skills first. */
  rows: SkillRepo[];
  agents: number;
  claude: number;
  both: number;
  skillFiles: number;
  medianSkills: number | null;
  /** SKILL.md files only outside both directories: mostly skills a project publishes for its users. */
  elsewhereOnly: SkillRepo[];
  trend: SkillsTrendPoint[];
};

const TREND_POINTS = 6;
const total = (r: Pick<SkillRepo, "agents" | "claude">) => r.agents + r.claude;

export function buildAgentSkillsReport(
  census: { generatedAt: string; repos: CensusRepo[] },
  board: LeaderboardRow[],
  skillFiles: SignalFile[],
  points: AdoptionPoint[],
): AgentSkillsReport {
  const onBoard = new Map(board.map((r) => [repoKey(r), r]));
  const rootDir = new Set(skillFiles.filter((f) => f.pass >= 1).map((f) => f.repoId));
  const read = census.repos.filter((r) => !r.error);

  const all: SkillRepo[] = read.map((c) => {
    const b = onBoard.get(repoKey(c)) ?? null;
    return {
      host: c.host,
      owner: c.owner,
      name: c.name,
      stars: b?.stars ?? null,
      ...c.skills,
      agentsDirUrl: b && rootDir.has(b.id) ? repoFileUrl(b, ".agents/skills", true) : null,
      board: b,
    };
  });
  const byCount = (a: SkillRepo, b: SkillRepo) =>
    total(b) - total(a) || b.other - a.other || (b.stars ?? 0) - (a.stars ?? 0) || repoKey(a).localeCompare(repoKey(b));
  const rows = all.filter((r) => total(r) > 0).sort(byCount);

  // Evenly spaced from the first point the series measured skills in, ending on the latest.
  const measured = points.filter((p) => p.agentSkills != null);
  const step = Math.max(1, Math.ceil((measured.length - 1) / (TREND_POINTS - 1)));
  const trend = measured
    .filter((_, i) => i % step === 0 || i === measured.length - 1)
    .map((p) => ({ date: p.date, repos: p.repos, count: p.agentSkills ?? 0 }));

  return {
    date: census.generatedAt.slice(0, 10),
    repos: read.length,
    rows,
    agents: rows.filter((r) => r.agents > 0).length,
    claude: rows.filter((r) => r.claude > 0).length,
    both: rows.filter((r) => r.agents > 0 && r.claude > 0).length,
    skillFiles: rows.reduce((n, r) => n + total(r), 0),
    medianSkills: median(rows.map(total)),
    elsewhereOnly: all
      .filter((r) => total(r) === 0 && r.other > 0)
      .sort((a, b) => b.other - a.other || repoKey(a).localeCompare(repoKey(b))),
    trend,
  };
}

export function agentSkillsTitle(r: Pick<AgentSkillsReport, "rows" | "repos">): string {
  return `Agent skills: ${r.rows.length} of ${r.repos} popular repos ship them`;
}

export function agentSkillsDescription(r: AgentSkillsReport): string {
  return fitDescription(
    `${r.rows.length} of ${r.repos} popular GitHub repos ship SKILL.md files for coding agents: ${r.agents} in .agents/skills, ${r.claude} in .claude/skills.`,
    "Every repo listed, with counts and a CSV.",
  );
}

export function agentSkillsCsv(rows: SkillRepo[]): string {
  const lines = rows.map((r) =>
    [`${r.owner}/${r.name}`, r.host, r.agents, r.claude, r.other, r.stars ?? null].map(csvField).join(","),
  );
  return `${["repo", "host", "agents_skills", "claude_skills", "skill_md_elsewhere", "stars"].join(",")}\n${lines.join("\n")}\n`;
}

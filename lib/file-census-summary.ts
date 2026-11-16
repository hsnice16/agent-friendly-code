// No data import, so scripts/file-census.ts can summarise the rows it just read.

export type CensusRepo = {
  host: string;
  owner: string;
  name: string;
  truncated: boolean;
  /** Set when the tree read failed; every list below is then empty, not measured. */
  error?: string;
  agentsMd: string[];
  claudeMd: string[];
  geminiMd: string[];
  rootLinks: Record<string, string>;
  claudeMdImportsAgentsMd: boolean | null;
  copilotInstructions: boolean;
  copilotPathInstructions: number;
  windsurfRules: number;
  windsurfrulesLegacy: boolean;
  cursorRules: number;
  cursorrulesLegacy: boolean;
  llmsTxt: string[];
  skills: { agents: number; claude: number; other: number };
};

const isRoot = (p: string, base: string) => p.toLowerCase() === base.toLowerCase();

export type CensusSummary = {
  /** Trees read; a failed read is left out of every count, so it can't read as a repo with no files. */
  repos: number;
  date: string;
  anyAgentsMd: number;
  rootAgentsMd: number;
  /** More than one AGENTS.md, or one below the root. */
  nestedAgentsMd: number;
  mostAgentsMd: { repo: string; files: number }[];
  anyClaudeMd: number;
  rootClaudeMd: number;
  /** A CLAUDE.md in a subdirectory; `.claude/CLAUDE.md` is a root location, not nesting. */
  nestedClaudeMd: number;
  claudeLinksToAgents: number;
  /** A root AGENTS.md or CLAUDE.md that is a symlink, to whatever file. */
  anyRootLink: number;
  claudeImportsAgents: number;
  /** Root AGENTS.md and CLAUDE.md both present, however they relate. */
  rootBoth: number;
  /** Root AGENTS.md and CLAUDE.md as two real files, the CLAUDE.md not importing the other. */
  twoUnlinkedFiles: number;
  copilot: number;
  copilotPath: number;
  copilotPathFiles: number;
  copilotAndAgentsMd: number;
  cursorRules: number;
  cursorrulesLegacy: number;
  windsurf: number;
  windsurfLegacy: number;
  geminiMd: number;
  llmsTxt: number;
  /** An llms.txt at the repo root, rather than in a docs site's static folder. */
  llmsTxtRoot: number;
  /** Trees GitHub cut short, which make every count above a floor. */
  truncated: number;
  skillsAgents: number;
  skillsClaude: number;
  skillsBoth: number;
};

export function summarizeCensus(all: CensusRepo[], generatedAt: string): CensusSummary {
  const repos = all.filter((r) => !r.error);
  const n = (pred: (r: CensusRepo) => boolean) => repos.filter(pred).length;
  const rootAgents = (r: CensusRepo) => r.agentsMd.some((p) => isRoot(p, "AGENTS.md"));
  const rootClaude = (r: CensusRepo) => r.claudeMd.some((p) => isRoot(p, "CLAUDE.md"));
  const claudeLink = (r: CensusRepo) => r.rootLinks["CLAUDE.md"];
  const agentsLink = (r: CensusRepo) => r.rootLinks["AGENTS.md"];
  const linked = (r: CensusRepo) => claudeLink(r) != null || agentsLink(r) != null;

  return {
    repos: repos.length,
    date: generatedAt.slice(0, 10),
    anyAgentsMd: n((r) => r.agentsMd.length > 0),
    rootAgentsMd: n(rootAgents),
    nestedAgentsMd: n((r) => r.agentsMd.length > 1 || (r.agentsMd.length === 1 && !rootAgents(r))),
    mostAgentsMd: repos
      .filter((r) => r.agentsMd.length > 1)
      .sort((a, b) => b.agentsMd.length - a.agentsMd.length || a.name.localeCompare(b.name))
      .slice(0, 10)
      .map((r) => ({ repo: `${r.owner}/${r.name}`, files: r.agentsMd.length })),
    anyClaudeMd: n((r) => r.claudeMd.length > 0),
    rootClaudeMd: n(rootClaude),
    nestedClaudeMd: n((r) => r.claudeMd.some((p) => p.includes("/") && !p.toLowerCase().startsWith(".claude/"))),
    // huggingface keeps the real file at .ai/AGENTS.md and links both names to it.
    claudeLinksToAgents: n((r) => claudeLink(r)?.split("/").pop()?.toLowerCase() === "agents.md"),
    anyRootLink: n(linked),
    claudeImportsAgents: n((r) => r.claudeMdImportsAgentsMd === true),
    rootBoth: n((r) => rootAgents(r) && rootClaude(r)),
    twoUnlinkedFiles: n((r) => rootAgents(r) && rootClaude(r) && !linked(r) && r.claudeMdImportsAgentsMd !== true),
    copilot: n((r) => r.copilotInstructions),
    copilotPath: n((r) => r.copilotPathInstructions > 0),
    copilotPathFiles: repos.reduce((s, r) => s + r.copilotPathInstructions, 0),
    copilotAndAgentsMd: n((r) => r.copilotInstructions && rootAgents(r)),
    cursorRules: n((r) => r.cursorRules > 0),
    cursorrulesLegacy: n((r) => r.cursorrulesLegacy),
    windsurf: n((r) => r.windsurfRules > 0),
    windsurfLegacy: n((r) => r.windsurfrulesLegacy),
    geminiMd: n((r) => r.geminiMd.length > 0),
    llmsTxt: n((r) => r.llmsTxt.length > 0),
    llmsTxtRoot: n((r) => r.llmsTxt.some((p) => !p.includes("/"))),
    truncated: n((r) => r.truncated),
    skillsAgents: n((r) => r.skills.agents > 0),
    skillsClaude: n((r) => r.skills.claude > 0),
    skillsBoth: n((r) => r.skills.agents > 0 && r.skills.claude > 0),
  };
}

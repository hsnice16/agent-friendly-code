import { cache } from "react";

import { getCheckStats } from "../check-stats";
import { CENSUS_SUMMARY as C } from "../file-census";
import { getAgentsMdExamples } from "../leaderboard-files";
import { MODELS } from "../scoring/weights";
import { percent } from "../utils/format";

/** Every `{{key}}` a guide may use, as display text. */
export const getGuideStats = cache((): Record<string, string> => {
  const ex = getAgentsMdExamples();
  const skills = getCheckStats("agent_skills");

  return {
    boardSize: String(ex.boardSize),
    agents: String(MODELS.length),
    withFile: String(ex.rows.length),
    skillsRepos: String(skills.present),
    skillsPct: percent(skills.present, skills.total),
    medianChars: ex.medianLength != null ? ex.medianLength.toLocaleString("en-US") : "—",
    // From the file census, which reads the whole tree of each GitHub repo; the
    // board counts above come from the scorer, which stops at the first file.
    censusRepos: String(C.repos),
    censusDate: C.date,
    anyAgentsMd: String(C.anyAgentsMd),
    nestedAgentsMd: String(C.nestedAgentsMd),
    nestedAgentsMdPct: percent(C.nestedAgentsMd, C.anyAgentsMd),
    mostAgentsMd: C.mostAgentsMd
      .slice(0, 5)
      .map((m) => `${m.repo} (${m.files})`)
      .join(", "),
    anyClaudeMd: String(C.anyClaudeMd),
    rootClaudeMd: String(C.rootClaudeMd),
    nestedClaudeMd: String(C.nestedClaudeMd),
    claudeLinksToAgents: String(C.claudeLinksToAgents),
    anyRootLink: String(C.anyRootLink),
    claudeImportsAgents: String(C.claudeImportsAgents),
    twoUnlinkedFiles: String(C.twoUnlinkedFiles),
    copilotRepos: String(C.copilot),
    copilotPct: percent(C.copilot, C.repos),
    copilotPathRepos: String(C.copilotPath),
    copilotPathFiles: String(C.copilotPathFiles),
    copilotAndAgentsMd: String(C.copilotAndAgentsMd),
    cursorRulesRepos: String(C.cursorRules),
    windsurfRepos: String(C.windsurf),
    windsurfLegacy: String(C.windsurfLegacy),
    llmsTxtRepos: String(C.llmsTxt),
    llmsTxtRootRepos: String(C.llmsTxtRoot),
    censusTruncated: String(C.truncated),
    skillsAgentsRepos: String(C.skillsAgents),
    skillsClaudeRepos: String(C.skillsClaude),
    skillsBothRepos: String(C.skillsBoth),
  };
});

const TOKEN = /\{\{(\w+)\}\}/g;

export function fillStats(text: string, stats: Record<string, string>): string {
  return text.replace(TOKEN, (_, key: string) => {
    if (!Object.hasOwn(stats, key)) throw new Error(`Unknown guide stat {{${key}}}`);
    return stats[key];
  });
}

export function statKeys(text: string): string[] {
  return [...text.matchAll(TOKEN)].map((m) => m[1]);
}

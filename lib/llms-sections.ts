import { agentStandings, pairSplit } from "./agent-scores";
import { getAgentLanguages, getScoredRepos } from "./agent-scores-data";
import { pairLabels } from "./compare-copy";
import { COMPARE_PAIRS } from "./compare-pairs";
import { getLeaderboardStats, listLeaderboardOverall } from "./db";
import { commonGaps, getLanguageGroups } from "./language-hubs";
import { getAgentsMdExamples } from "./leaderboard-files";
import { boardLeader, LEADER_QUALIFIER } from "./leaderboard-meta";
import { checkPath } from "./utils/check-path";
import { comparePath } from "./utils/compare-path";
import { percent } from "./utils/format";
import { averageScore, hubAgentsPath, hubPath, isHub } from "./utils/language";
import { modelPath } from "./utils/leaderboard-href";
import { repoPath } from "./utils/repo-path";
import { REPORT_PATH, SIZE_REPORT_PATH } from "./utils/report-path";
import { APP_URL } from "./version";

// Labels come from host APIs; stripping link syntax keeps one from forging a link.
const safe = (label: string) => label.replace(/[[\]()\n]/g, "");

export function keyFacts(): string {
  const board = listLeaderboardOverall();
  const top = boardLeader(board);
  const ex = getAgentsMdExamples();
  const standings = agentStandings(getScoredRepos());
  const first = standings[0];
  const last = standings[standings.length - 1];
  const gap = commonGaps(board.map((r) => r.id))[0];
  const day = new Date((getLeaderboardStats().lastScoredAt ?? 0) * 1000).toISOString().slice(0, 10);

  const facts = [
    `- ${board.length} public repos scored; they average ${averageScore(board).toFixed(1)} / 100 overall ([leaderboard](${APP_URL}/))`,
    top &&
      `- ${LEADER_QUALIFIER}: [${top.owner}/${top.name}](${APP_URL}${repoPath(top)}) (${(top.score ?? 0).toFixed(1)})`,
    `- ${percent(ex.rows.length, ex.boardSize)} have an AGENTS.md or CLAUDE.md ([report](${APP_URL}${REPORT_PATH}))${
      ex.medianLength != null
        ? `; the median one is ${ex.medianLength.toLocaleString("en-US")} characters ([sizes](${APP_URL}${SIZE_REPORT_PATH}))`
        : ""
    }`,
    first &&
      last &&
      `- Repos are best set up for [${first.model.label}](${APP_URL}${modelPath(first.model.id)}) (average ${first.average.toFixed(1)}) and least for [${last.model.label}](${APP_URL}${modelPath(last.model.id)}) (${last.average.toFixed(1)})`,
    gap &&
      `- Most-missed check that several agents read: [${gap.label}](${APP_URL}${checkPath(gap.id)}), passed by ${Math.round(gap.rate * 100)}%`,
  ]
    .filter(Boolean)
    .join("\n");
  return `## Key facts (as of ${day})\n\n${facts}`;
}

export function compareLines(): string {
  const rows = getScoredRepos();
  return COMPARE_PAIRS.map((p) => {
    const s = pairSplit(rows, p.a, p.b);
    const { a, b } = pairLabels(p);
    return `- [${a} vs ${b}](${APP_URL}${comparePath(p.slug)}): ${a} ${s.avgA.toFixed(1)} vs ${b} ${s.avgB.toFixed(1)} across ${s.n} repos`;
  }).join("\n");
}

export function languageLines(): string {
  const withAgents = new Set(getAgentLanguages().map((g) => g.slug));
  return getLanguageGroups()
    .filter(isHub)
    .map((g) => {
      const agents = withAgents.has(g.slug) ? `; [which agent they suit](${APP_URL}${hubAgentsPath(g.slug)})` : "";
      return `- [${safe(g.label)}](${APP_URL}${hubPath(g.slug)}): ${g.rows.length} repos, average ${averageScore(g.rows).toFixed(1)}${agents}`;
    })
    .join("\n");
}

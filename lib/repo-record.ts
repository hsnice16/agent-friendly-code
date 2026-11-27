import rawHistory from "@/data/agent-file-history.json";

import { type FileHistory, type HistoryKey, parseFileHistory } from "./agent-file-history";
import { AI_POLICY, type AiPolicyData, STANCE_LABEL, type Stance, stanceAnchor } from "./ai-policy";
import { CENSUS, type CensusRepo } from "./file-census";
import { type FileReaders, fileReaders, type RootFiles } from "./repo-readers";
import type { SignalResult } from "./scoring/signals";
import { hasAgentFile, OTHER_FILES } from "./utils/agent-instructions";
import { formatDay, plural } from "./utils/format";
import { repoFileUrl } from "./utils/repo-file-url";
import { repoKey } from "./utils/repo-path";
import { AI_POLICY_REPORT_PATH } from "./utils/report-path";

const HISTORY = parseFileHistory(rawHistory);

type Day = { iso: string; text: string };
const day = (iso: string): Day => ({ iso, text: formatDay(iso) });

/** `firstFound` null: there at the first check. `lastMissed`: see FirstSeen. */
export type FirstSeenFact = { file: string; checkedFrom: Day; firstFound: Day | null; lastMissed: Day | null };
type LinkedPath = { name: string; href: string | null };

export type CensusFacts = {
  date: Day;
  truncated: boolean;
  /** AGENTS.md, CLAUDE.md and GEMINI.md anywhere but the root, shallowest first. */
  nested: LinkedPath[];
  nestedTotal: number;
  other: string[];
  relations: string[];
};

export type PolicyFact = {
  stance: Stance;
  label: string;
  summary: string;
  /** The passage the stance was classified from. */
  href: string;
  path: string;
  checked: Day;
  reportHref: string;
};

/** Repo-specific facts from the committed data files; each is null or empty when that file holds nothing for it. */
export type RepoRecord = {
  firstSeen: FirstSeenFact[];
  census: CensusFacts | null;
  readers: FileReaders[];
  policy: PolicyFact | null;
};

type RepoRef = { host: string; owner: string; name: string; url: string };

export const NESTED_SHOWN = 6;

const isRootFile = (p: string) => /^(agents|claude|gemini)\.md$/i.test(p);
const depth = (p: string) => p.split("/").length;

/** What the checks find now, by history key: a date is only shown beside a file the page also shows. */
function presentFiles(signals: SignalResult[]): Map<HistoryKey, string> {
  const out = new Map<HistoryKey, string>();
  const byId = new Map(signals.map((s) => [s.id, s]));
  const main = byId.get("agents_md");
  const p = main?.matchedPath?.toLowerCase();
  if (main && hasAgentFile(main) && p === "agents.md") out.set("agentsMd", "AGENTS.md");
  if (main && hasAgentFile(main) && p === "claude.md") out.set("claudeMd", "CLAUDE.md");
  for (const f of OTHER_FILES) {
    const s = byId.get(f.signalId);
    if (!s || !hasAgentFile(s)) continue;
    out.set(f.key, f.signalId === "cursor_rules" && s.matchedPath === ".cursorrules" ? ".cursorrules" : f.name);
  }
  return out;
}

export function firstSeenFacts(
  repo: RepoRef,
  signals: SignalResult[],
  history: FileHistory = HISTORY,
): FirstSeenFact[] {
  const entry = history[repo.url.toLowerCase()];
  if (!entry) return [];
  return [...presentFiles(signals)].flatMap(([key, file]) => {
    const seen = entry[key];
    if (!seen) return [];
    const { checkedFrom, firstFound, lastMissed } = seen;
    const later = firstFound !== checkedFrom;
    return [
      {
        file,
        checkedFrom: day(checkedFrom),
        firstFound: later ? day(firstFound) : null,
        lastMissed: later && lastMissed ? day(lastMissed) : null,
      },
    ];
  });
}

function censusRow(repo: RepoRef, census: { generatedAt: string; repos: CensusRepo[] }): CensusRepo | null {
  const key = repoKey(repo);
  return census.repos.find((r) => !r.error && repoKey(r) === key) ?? null;
}

export function censusFacts(
  repo: RepoRef,
  census: { generatedAt: string; repos: CensusRepo[] } = CENSUS,
): CensusFacts | null {
  const c = censusRow(repo, census);
  if (!c) return null;

  const all = [...c.agentsMd, ...c.claudeMd, ...c.geminiMd].filter((p) => !isRootFile(p));
  all.sort((a, b) => depth(a) - depth(b) || (a < b ? -1 : 1));
  // The census read this branch; the paths are the tree as it stood then.
  const at = { url: repo.url, host: repo.host, default_branch: c.branch ?? null };
  const nested = all.slice(0, NESTED_SHOWN).map((p) => ({ name: p, href: repoFileUrl(at, p) }));

  const other = [
    c.copilotInstructions && ".github/copilot-instructions.md",
    c.copilotPathInstructions > 0 && `.github/instructions/ (${plural(c.copilotPathInstructions, "file")})`,
    c.windsurfRules > 0 && `.windsurf/rules/ (${plural(c.windsurfRules, "file")})`,
    c.windsurfrulesLegacy && ".windsurfrules",
    c.skills.claude > 0 && `.claude/skills/ (${plural(c.skills.claude, "skill")})`,
  ].filter((x): x is string => Boolean(x));

  const relations = Object.entries(c.rootLinks)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([file, target]) => `${file} is a symlink to ${target}`);
  if (c.claudeMdImportsAgentsMd) relations.push("CLAUDE.md imports @AGENTS.md");

  if (all.length === 0 && other.length === 0 && relations.length === 0) return null;
  return {
    date: day(census.generatedAt.slice(0, 10)),
    truncated: c.truncated,
    nested,
    nestedTotal: all.length,
    other,
    relations,
  };
}

export function policyFact(repo: RepoRef, data: AiPolicyData = AI_POLICY): PolicyFact | null {
  const key = repoKey(repo);
  const p = data.policies.find((x) => repoKey(x) === key);
  if (!p) return null;
  return {
    stance: p.stance,
    label: STANCE_LABEL[p.stance],
    summary: p.summary,
    href: p.url,
    path: p.path,
    checked: day(data.checked),
    reportHref: `${AI_POLICY_REPORT_PATH}#${stanceAnchor(p.stance)}`,
  };
}

export function repoRecord(repo: RepoRef, signals: SignalResult[]): RepoRecord | null {
  const c = censusRow(repo, CENSUS);
  const root: RootFiles = c && {
    agentsMd: c.agentsMd.some((p) => p.toLowerCase() === "agents.md"),
    claudeMdLoadsAgentsMd: /(^|\/)agents\.md$/i.test(c.rootLinks["CLAUDE.md"] ?? "")
      ? "links"
      : c.claudeMdImportsAgentsMd
        ? "imports"
        : null,
  };
  const record: RepoRecord = {
    firstSeen: firstSeenFacts(repo, signals),
    census: censusFacts(repo),
    readers: fileReaders(signals, root),
    policy: policyFact(repo),
  };
  const empty = !record.firstSeen.length && !record.census && !record.readers.length && !record.policy;
  return empty ? null : record;
}

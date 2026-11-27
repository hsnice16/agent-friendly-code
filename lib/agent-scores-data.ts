import { buildFilePresence, FILE_KINDS, type FilePresence } from "./agent-files";
import { agentLanguages, buildScoredRepos, type ScoredRepo } from "./agent-scores";
import { dbVersion, listLeaderboard, listLeaderboardOverall, listSignalFiles } from "./db";
import { MODELS } from "./scoring/weights";
import type { LanguageGroup } from "./utils/language";

type Data = { rows: ScoredRepo[]; presence: FilePresence; languages: LanguageGroup<ScoredRepo>[] };

// Per process, keyed on dbVersion, as check-stats is: /agents, llms.txt and
// every language hub of a static build read every agent's board.
let memo: { key: string; data: Data } | null = null;

function load(): Data {
  const key = dbVersion();
  if (memo?.key === key) return memo.data;

  const rows = buildScoredRepos(
    listLeaderboardOverall(),
    MODELS.map((m) => ({ id: m.id, rows: listLeaderboard({ model: m.id }) })),
  );
  const signalIds = [...new Set(FILE_KINDS.map((k) => k.signalId))];
  const presence = buildFilePresence(Object.fromEntries(signalIds.map((id) => [id, listSignalFiles(id)])));
  const data = { rows, presence, languages: agentLanguages(rows) };
  memo = { key, data };
  return data;
}

export const getScoredRepos = (): ScoredRepo[] => load().rows;
export const getFilePresence = (): FilePresence => load().presence;
export const getAgentLanguages = (): LanguageGroup<ScoredRepo>[] => load().languages;

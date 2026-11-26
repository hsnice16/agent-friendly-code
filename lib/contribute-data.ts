import { aiPolicyByRepo, STANCE_LABEL } from "./ai-policy";
import { buildContributeList, CONTRIBUTE_SIGNAL_IDS, type ContributeList, type ContributeSignals } from "./contribute";
import { listLeaderboardOverall, listSignalFiles } from "./db";
import { repoKey } from "./utils/repo-path";

export function getContributeList(): ContributeList {
  const signals = Object.fromEntries(CONTRIBUTE_SIGNAL_IDS.map((id) => [id, listSignalFiles(id)])) as ContributeSignals;
  const board = listLeaderboardOverall();
  const found = aiPolicyByRepo();
  const policies = new Map(
    board.flatMap((r) => {
      const p = found.get(repoKey(r));
      return p ? [[r.id, { label: STANCE_LABEL[p.stance], url: p.url, refusesAi: p.stance === "bans" }] as const] : [];
    }),
  );
  return buildContributeList(board, signals, policies);
}

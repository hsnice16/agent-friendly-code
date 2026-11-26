import { AI_POLICY, type AiPolicyData } from "./ai-policy";
import { listLeaderboardOverall, listSignalPasses } from "./db";
import { repoKey } from "./utils/repo-path";
import { AI_POLICY_REPORT_PATH } from "./utils/report-path";

/**
 * Written AI policies whose AI section raises the licensing or copyright of
 * AI-generated code, each read in full. A policy that only restates the project's
 * CLA or DCO for every contribution is not on it.
 */
export const LICENSE_CITING = {
  read: "2026-11-25",
  repos: [
    "psf/requests",
    "llvm/llvm-project",
    "obsproject/obs-studio",
    "ClickHouse/ClickHouse",
    "grafana/grafana",
    "nodejs/node",
    "curl/curl",
    "apache/kafka",
    "apache/pulsar",
    "elixir-lang/elixir",
    "ktorio/ktor",
    "nextcloud/server",
    "PostgREST/postgrest",
    "sharkdp/fd",
    "sqlfluff/sqlfluff",
    "nautechsystems/nautilus_trader",
  ],
};

const EXAMPLES = 3;

/** The /check/license sentence tying license files to the AI policy dataset, with `[label](url)` links. */
export function licensePolicyNote(data: AiPolicyData = AI_POLICY): string {
  const board = new Map(listLeaderboardOverall().map((r) => [repoKey(r), r.id]));
  const licensed = new Set(listSignalPasses("license").flatMap((r) => (r.pass >= 1 ? [r.repoId] : [])));
  const onBoard = data.policies.filter((p) => board.has(repoKey(p)));
  const withLicense = onBoard.filter((p) => licensed.has(board.get(repoKey(p)) ?? -1)).length;
  const byKey = new Map(onBoard.map((p) => [repoKey(p), p]));
  const cites = LICENSE_CITING.repos.flatMap((r) => byKey.get(`github/${r}`.toLowerCase()) ?? []);
  const examples = cites
    .slice(0, EXAMPLES)
    .map((p) => `[${p.owner}/${p.name}](${p.url})`)
    .join(", ");
  const policy = `with a written [AI contribution policy](${AI_POLICY_REPORT_PATH})`;
  const share =
    withLicense === onBoard.length
      ? `All ${onBoard.length} repos ${policy} have a license file`
      : `${withLicense} of the ${onBoard.length} repos ${policy} have a license file`;
  const among = examples ? `, among them ${examples}` : "";
  return `${share}. Read on ${LICENSE_CITING.read}, ${cites.length} of those policies raise the licensing or copyright of AI-generated code${among}.`;
}

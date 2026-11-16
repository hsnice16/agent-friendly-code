import { CONTRIBUTE_LANGUAGE_TOP, CONTRIBUTE_TOP, LANGUAGE_AGENTS_MIN_REPOS } from "./constants/scoring";
import type { LeaderboardRow, SignalFile } from "./types/db";
import { hasAgentFile } from "./utils/agent-instructions";
import { groupByLanguage, UNKNOWN_LANGUAGE } from "./utils/language";
import { repoOwnership } from "./utils/own-repo";
import { fitDescription } from "./utils/page-title";

export const CONTRIBUTE_SIGNAL_IDS = ["contributing", "tests", "ci", "agents_md", "dev_env", "pre_commit"] as const;
export type ContributeSignals = Record<(typeof CONTRIBUTE_SIGNAL_IDS)[number], SignalFile[]>;

/** A project's stated stance on AI-assisted contributions, from outside the scorer. */
export type ContributePolicy = { label: string; url: string | null; refusesAi?: boolean };

export type ContributeRow = LeaderboardRow & {
  /** The AGENTS.md or CLAUDE.md the check found with content, or null. */
  agentFile: string | null;
  devSetup: boolean;
  preCommit: boolean;
  policy: ContributePolicy | null;
};

export type ContributeLanguage = { slug: string; label: string; eligible: number; rows: ContributeRow[] };

export type ContributeList = {
  boardSize: number;
  /** Board repos with all three, the author's own included: the lead counts the board, not the list. */
  withWorkflow: number;
  eligible: ContributeRow[];
  /** Would qualify, but the project's own policy refuses AI-generated contributions. */
  refused: number;
  top: ContributeRow[];
  languages: ContributeLanguage[];
};

// The dev_env check gives 0.6 for a package.json with scripts alone; a Makefile,
// devcontainer, Docker file or the like starts at 0.7.
const DEV_SETUP_PASS = 0.7;

function byRepo(files: SignalFile[]): Map<number, SignalFile> {
  return new Map(files.map((f) => [f.repoId, f]));
}

/**
 * Board repos with a CONTRIBUTING guide, tests and CI, in board order (score,
 * then stars). The author's own repos are left out: a list of picks reads as a
 * recommendation, which the board's label can't qualify here.
 */
export function buildContributeList(
  board: LeaderboardRow[],
  signals: ContributeSignals,
  policies: ReadonlyMap<number, ContributePolicy> = new Map(),
): ContributeList {
  const s = Object.fromEntries(CONTRIBUTE_SIGNAL_IDS.map((id) => [id, byRepo(signals[id])])) as Record<
    keyof ContributeSignals,
    Map<number, SignalFile>
  >;
  const passes = (id: keyof ContributeSignals, repoId: number, min: number) => (s[id].get(repoId)?.pass ?? 0) >= min;

  const withWorkflow = board.filter(
    (r) =>
      passes("contributing", r.id, 1) &&
      passes("tests", r.id, Number.MIN_VALUE) &&
      passes("ci", r.id, Number.MIN_VALUE),
  );
  const qualifies = withWorkflow.filter((r) => !repoOwnership(r));
  // A list of picks for agent-assisted work must not send people where agents are refused.
  const eligible: ContributeRow[] = qualifies
    .filter((r) => !policies.get(r.id)?.refusesAi)
    .map((r) => {
      const agents = s.agents_md.get(r.id);
      return {
        ...r,
        agentFile: agents && hasAgentFile(agents) ? agents.matchedPath : null,
        devSetup: passes("dev_env", r.id, DEV_SETUP_PASS),
        preCommit: passes("pre_commit", r.id, 1),
        policy: policies.get(r.id) ?? null,
      };
    });

  const languages = groupByLanguage(board)
    .filter((g) => g.slug !== UNKNOWN_LANGUAGE.slug && g.rows.length >= LANGUAGE_AGENTS_MIN_REPOS)
    .map((g) => {
      const ids = new Set(g.rows.map((b) => b.id));
      const rows = eligible.filter((r) => ids.has(r.id));
      return { slug: g.slug, label: g.label, eligible: rows.length, rows: rows.slice(0, CONTRIBUTE_LANGUAGE_TOP) };
    })
    .filter((l) => l.rows.length > 0)
    .sort((a, b) => b.eligible - a.eligible);

  return {
    boardSize: board.length,
    withWorkflow: withWorkflow.length,
    eligible,
    refused: qualifies.length - eligible.length,
    top: eligible.slice(0, CONTRIBUTE_TOP),
    languages,
  };
}

export function hasPolicies(rows: ContributeRow[]): boolean {
  return rows.some((r) => r.policy != null);
}

export const CONTRIBUTE_TITLE = "Best open source projects to contribute to with AI agents";

export function contributeDescription(list: Pick<ContributeList, "eligible" | "languages">): string {
  const langs = list.languages.slice(0, 4).map((l) => l.label);
  return fitDescription(
    `${list.eligible.length} open source projects with a CONTRIBUTING guide, tests and CI, ranked for AI coding agents.`,
    ...(langs.length > 0 ? [`Top picks in ${langs.join(", ")} and more.`] : []),
  );
}

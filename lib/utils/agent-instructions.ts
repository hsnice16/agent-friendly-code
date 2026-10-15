import type { SignalResult } from "@/lib/scoring/signals";

/** One agent file found in the repo. `path` is what to link; `note` comes from the check's own detail. */
export type AgentFile = { name: string; path: string; directory: boolean; note: string | null };

export type AgentFileShare = {
  has: number;
  total: number;
  language: { label: string; has: number; total: number } | null;
};

export type AgentInstructionsData = {
  main: (AgentFile & { state: "ok" | "thin" | "empty" }) | null;
  /** Main-file names known to be absent. Past the first match the check looks no further, so this is never a guess. */
  absentMain: string[];
  others: AgentFile[];
  absentOthers: string[];
  share: AgentFileShare;
};

// The agent-file checks give an empty file 0.2. Counting that as having one
// would credit a repo with instructions it doesn't have.
export const HAS_FILE_PASS = 0.5;

/** Whether an agent-file check found the file with content in it. */
export function hasAgentFile(s: { pass: number; matchedPath?: string | null }): boolean {
  return s.pass >= HAS_FILE_PASS && !!s.matchedPath;
}

// The agents_md check's candidates, in its lookup order.
const MAIN_FILES = ["AGENTS.md", "CLAUDE.md", "AGENT.md"];

const OTHERS: { id: string; name: string }[] = [
  { id: "gemini_md", name: "GEMINI.md" },
  { id: "cursor_rules", name: ".cursor/rules" },
  { id: "openhands_setup", name: ".openhands/setup.sh" },
  { id: "aider_conf", name: ".aider.conf.yml" },
];

const NUMBER = new Intl.NumberFormat("en-US");

/** Characters after trimming, as the check measured them; null when its detail has no count. */
export function fileLength(detail: string | null): number | null {
  // "(14688 chars)" is the older form still in rows not rescored since.
  const m = detail?.match(/\(([\d,]+) (?:characters|chars)\)/);
  return m ? Number(m[1].replaceAll(",", "")) : null;
}

function chars(detail: string): string | null {
  const n = fileLength(detail);
  return n == null ? null : `${NUMBER.format(n)} characters`;
}

function other(s: SignalResult, name: string): AgentFile | null {
  if (s.pass === 0 || !s.matchedPath) return null;
  if (s.id === "cursor_rules") {
    const mdc = /^(\d+) \.mdc files? in/.exec(s.detail);
    return mdc
      ? { name, path: ".cursor/rules", directory: true, note: `${mdc[1]} .mdc file${mdc[1] === "1" ? "" : "s"}` }
      : { name: s.matchedPath, path: s.matchedPath, directory: false, note: "the legacy form" };
  }
  const note = s.pass < HAS_FILE_PASS ? "empty" : chars(s.detail);
  return { name: s.matchedPath, path: s.matchedPath, directory: false, note };
}

export function agentInstructions(signals: SignalResult[], share: AgentFileShare): AgentInstructionsData | null {
  const byId = new Map(signals.map((s) => [s.id, s]));
  const agentsMd = byId.get("agents_md");
  if (!agentsMd) return null;

  const matched = agentsMd.pass > 0 ? agentsMd.matchedPath : undefined;
  const at = matched ? MAIN_FILES.findIndex((f) => f.toLowerCase() === matched.toLowerCase()) : -1;

  const others: AgentFile[] = [];
  const absentOthers: string[] = [];
  for (const o of OTHERS) {
    const s = byId.get(o.id);
    if (!s) continue;
    const found = other(s, o.name);
    if (found) others.push(found);
    else absentOthers.push(o.name);
  }

  return {
    main: matched
      ? {
          name: matched,
          path: matched,
          directory: false,
          note: chars(agentsMd.detail),
          state: agentsMd.pass < HAS_FILE_PASS ? "empty" : agentsMd.pass < 0.8 ? "thin" : "ok",
        }
      : null,
    absentMain: matched ? MAIN_FILES.slice(0, Math.max(at, 0)) : MAIN_FILES,
    others,
    absentOthers,
    share,
  };
}

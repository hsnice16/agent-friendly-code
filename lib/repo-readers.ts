import { agentsReading, agentsUsingAgentsMd } from "./agent-reads";
import type { SignalResult } from "./scoring/signals";
import { MODEL_BY_ID, type ModelId } from "./scoring/weights";
import { hasAgentFile } from "./utils/agent-instructions";
import { agentList } from "./utils/agent-list";

/** One of the repo's files and, as prose, the scored agents whose docs say they read it. */
export type FileReaders = { file: string; readers: string };

// Each check's match, as AGENT_READS names the file. Only root locations: the
// docs these come from describe the root, and a nested copy can be skipped.
const OWN_FILES: { signalId: string; file: string; shown: string; matches: (p: string) => boolean }[] = [
  { signalId: "gemini_md", file: "GEMINI.md", shown: "GEMINI.md", matches: (p) => p === "gemini.md" },
  {
    signalId: "cursor_rules",
    file: ".cursor/rules/*.mdc",
    shown: ".cursor/rules",
    matches: (p) => p.startsWith(".cursor/rules/") && p.endsWith(".mdc"),
  },
  {
    signalId: "agent_skills",
    file: ".agents/skills/",
    shown: ".agents/skills",
    matches: (p) => p.startsWith(".agents/skills/"),
  },
  {
    signalId: "openhands_setup",
    file: ".openhands/setup.sh",
    shown: ".openhands/setup.sh",
    matches: (p) => p === ".openhands/setup.sh",
  },
  {
    signalId: "aider_conf",
    file: ".aider.conf.yml",
    shown: ".aider.conf.yml",
    matches: (p) => p === ".aider.conf.yml",
  },
];

// Pi loads only the first of AGENTS.md and CLAUDE.md, and an empty AGENTS.md
// still counts as first (its AGENT_READS note).
export const FIRST_FILE_ONLY: ModelId[] = ["pi"];
const firstFileOnly = FIRST_FILE_ONLY.map((id) => MODEL_BY_ID[id].label);

/** What the file census saw at the root; null for a repo it didn't read. */
export type RootFiles = { agentsMd: boolean; claudeMdLoadsAgentsMd: "imports" | "links" | null } | null;

const LOADS = { imports: "which imports it", links: "a symlink to it" } as const;

function mainReaders(file: string, root: RootFiles): string | null {
  if (file === "AGENTS.md") {
    const parts = [agentList(agentsUsingAgentsMd("always"))];
    const fallback = agentsUsingAgentsMd("fallback");
    const setting = agentsUsingAgentsMd("setting");
    const via = root?.claudeMdLoadsAgentsMd;
    if (fallback.length && via) parts.push(`${agentList(fallback)} through CLAUDE.md, ${LOADS[via]}`);
    else if (fallback.length) parts.push(`${agentList(fallback)} only when there is no CLAUDE.md`);
    if (setting.length) parts.push(`${agentList(setting)} only once configured to`);
    return parts.join("; ");
  }
  // Without a census we can't rule out an empty AGENTS.md beside it, so those agents are left out.
  const readers = agentsReading(file).filter((a) => root?.agentsMd === false || !firstFileOnly.includes(a));
  return readers.length ? agentList(readers) : null;
}

/**
 * Which agents read the agent files the checks found at the root, per their docs.
 */
export function fileReaders(signals: SignalResult[], root: RootFiles): FileReaders[] {
  const byId = new Map(signals.map((s) => [s.id, s]));
  const out: FileReaders[] = [];

  const main = byId.get("agents_md");
  if (main?.matchedPath && hasAgentFile(main)) {
    const path = main.matchedPath.toLowerCase();
    const known = ["AGENTS.md", "CLAUDE.md", ".claude/CLAUDE.md"].find((f) => f.toLowerCase() === path);
    const readers = known ? mainReaders(known, root) : null;
    if (known && readers) out.push({ file: known, readers });
  }

  for (const o of OWN_FILES) {
    const s = byId.get(o.signalId);
    if (!s?.matchedPath || !hasAgentFile(s) || !o.matches(s.matchedPath.toLowerCase())) continue;
    const readers = agentsReading(o.file);
    if (readers.length) out.push({ file: o.shown, readers: agentList(readers) });
  }
  return out;
}

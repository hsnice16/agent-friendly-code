import type { SignalFile } from "./types/db";
import { hasAgentFile, rootInstructionFile } from "./utils/agent-instructions";

export type FileKind = "agentsMd" | "claudeMdOnly" | "cursorRules" | "geminiMd" | "agentSkills";

/** Repo ids per kind; empty files excluded. */
export type FilePresence = Record<FileKind, Set<number>>;

export const FILE_KINDS: { kind: FileKind; file: string; signalId: string }[] = [
  { kind: "agentsMd", file: "AGENTS.md", signalId: "agents_md" },
  { kind: "claudeMdOnly", file: "CLAUDE.md only", signalId: "agents_md" },
  { kind: "cursorRules", file: ".cursor/rules", signalId: "cursor_rules" },
  { kind: "geminiMd", file: "GEMINI.md", signalId: "gemini_md" },
  { kind: "agentSkills", file: ".agents/skills", signalId: "agent_skills" },
];

const ids = (files: SignalFile[]) => new Set(files.filter(hasAgentFile).map((f) => f.repoId));

// The AGENTS.md check takes AGENTS.md first, so a CLAUDE.md is only ever the
// match where there is no AGENTS.md; "CLAUDE.md only" is all it can say.
export function buildFilePresence(bySignal: Record<string, SignalFile[]>): FilePresence {
  const main = (bySignal.agents_md ?? []).filter(hasAgentFile);
  const named = (name: string) =>
    new Set(main.filter((f) => rootInstructionFile(f.matchedPath ?? "") === name).map((f) => f.repoId));
  return {
    agentsMd: named("AGENTS.md"),
    claudeMdOnly: named("CLAUDE.md"),
    cursorRules: ids(bySignal.cursor_rules ?? []),
    geminiMd: ids(bySignal.gemini_md ?? []),
    agentSkills: ids(bySignal.agent_skills ?? []),
  };
}

export function fileShares(
  repoIds: number[],
  presence: FilePresence,
): { file: string; signalId: string; count: number }[] {
  return FILE_KINDS.map((k) => ({
    file: k.file,
    signalId: k.signalId,
    count: repoIds.filter((id) => presence[k.kind].has(id)).length,
  }));
}

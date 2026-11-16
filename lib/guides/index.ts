import { AGENTS_MD_MONOREPO } from "./agents-md-monorepo";
import { AGENTS_MD_VS_SKILLS } from "./agents-md-vs-skills";
import { CLAUDE_MD } from "./claude-md";
import { CODING_AGENT_BENCHMARKS } from "./coding-agent-benchmarks";
import { COPILOT_INSTRUCTIONS } from "./copilot-instructions";
import { DEVIN_DESKTOP_RULES } from "./devin-desktop-rules";
import { LLMS_TXT_VS_AGENTS_MD } from "./llms-txt-vs-agents-md";
import { ONE_FILE_FOR_ALL_AGENTS } from "./one-file-for-all-agents";
import type { Guide } from "./types";

export const GUIDES: Guide[] = [
  CLAUDE_MD,
  COPILOT_INSTRUCTIONS,
  ONE_FILE_FOR_ALL_AGENTS,
  AGENTS_MD_VS_SKILLS,
  AGENTS_MD_MONOREPO,
  DEVIN_DESKTOP_RULES,
  LLMS_TXT_VS_AGENTS_MD,
  CODING_AGENT_BENCHMARKS,
];

/** The /guide hub's one-line note per guide; tests/guides.test.ts keeps it in step with GUIDES. */
export const GUIDE_NOTES: Record<string, string> = {
  "claude-md": "Claude Code's file, with examples",
  "copilot-instructions": "for GitHub Copilot",
  "one-file-for-all-agents": "symlink or import",
  "agents-md-vs-skills": "what goes where",
  "agents-md-monorepo": "nested files, per agent",
  "devin-desktop-rules": "formerly Windsurf",
  "llms-txt-vs-agents-md": "website file vs repo file",
  "coding-agent-benchmarks": "what SWE-bench and others measure",
};

export function guideBySlug(slug: string): Guide | null {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}

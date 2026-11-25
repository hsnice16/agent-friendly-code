import {
  TESTS_DIR_DETAIL_PREFIX,
  TESTS_FILES_DETAIL_PREFIX,
  TESTS_SCRIPT_DETAIL,
  TYPED_LANGUAGE_DETAIL_PREFIX,
} from "@/lib/scoring/details";
import type { SignalResult } from "@/lib/scoring/signals";
import { VS_AGENTS_MD } from "./check-content/vs-agents-md";
import { type AgentInstructionsData, HAS_FILE_PASS } from "./utils/agent-instructions";
import { INVISIBLE } from "./utils/repo-about";

type Repo = { owner: string; name: string; language: string | null; description?: string | null };

const TASK_RUNNERS = new Set(["makefile", "justfile", "taskfile.yml"]);
const WRAPPERS = new Set(["gradlew", "mvnw"]);
const TEST_ENVS = new Set(["tox.ini", "noxfile.py"]);

// dev_env passes on artifacts that say different things: a package.json with
// enough scripts is not an environment, a Makefile is a task list.
function devEnvLine(p: string): string {
  const file = p.toLowerCase();
  if (file === "package.json") return "Project tasks are the `scripts` in `package.json`.";
  if (TASK_RUNNERS.has(file)) return `Common tasks are targets in \`${p}\`.`;
  if (WRAPPERS.has(file)) return `Use the \`./${p}\` wrapper, not a system install.`;
  if (TEST_ENVS.has(file)) return `Test environments are defined in \`${p}\`.`;
  if (file === "bin/setup") return `Setup is scripted in \`${p}\`.`;
  return `A reproducible environment is defined in \`${p}\`.`;
}

// Paths only: the checks record where a file is, never what it runs, so every
// command is left for the owner to fill in rather than guessed from the path.
const FACTS: { id: string; line: (p: string, s: SignalResult) => string }[] = [
  { id: "deps_manifest", line: (p) => `Dependencies are declared in \`${p}\`.` },
  {
    id: "tests",
    // The detail says which the check found: a test directory, one test file, or only a test script.
    line: (p, s) =>
      s.detail === TESTS_SCRIPT_DETAIL
        ? `A test script is defined in \`${p}\`.`
        : s.detail?.startsWith(TESTS_FILES_DETAIL_PREFIX) ||
            (!s.detail?.startsWith(TESTS_DIR_DETAIL_PREFIX) && s.pass < 1)
          ? `Test files are spread through the tree, e.g. \`${p}\`.`
          : `Tests live in \`${p}\`.`,
  },
  { id: "linter", line: (p) => `Lint and format rules are configured in \`${p}\`.` },
  {
    id: "type_config",
    line: (p, s) =>
      s.detail?.startsWith(TYPED_LANGUAGE_DETAIL_PREFIX)
        ? `The compiler checks types; the build is defined in \`${p}\`.`
        : `Type checking is configured in \`${p}\`.`,
  },
  { id: "ci", line: (p) => `CI is defined in \`${p}\`; read it for the exact install, lint and test steps.` },
  { id: "pre_commit", line: (p) => `Commit hooks are set up in \`${p}\`; don't skip them.` },
  { id: "dev_env", line: devEnvLine },
  { id: "contributing", line: (p) => `Follow the conventions in \`${p}\`.` },
];

// The rest of a description is usually a feature list; the file is a starter, not a README.
function firstSentence(text: string): string {
  const first = /^.*?[.!?…](?=\s|$)/.exec(text.trim())?.[0] ?? text.trim();
  return /[.!?…]$/.test(first) ? first : `${first}.`;
}

/** A starter AGENTS.md from what the checks found. Null when the checks found nothing to say. */
export function starterAgentsMd(repo: Repo, signals: SignalResult[]): string | null {
  const byId = new Map(signals.map((s) => [s.id, s]));
  const facts = FACTS.flatMap(({ id, line }) => {
    const s = byId.get(id);
    // Tree paths are repo content: a newline would start a line of its own, a
    // bidi override would make the file read differently from its bytes, and a
    // backtick would close the code span the path sits in.
    const raw = s?.matchedPath?.replace(INVISIBLE, "");
    const path = raw?.includes("`") ? null : raw;
    return s && s.pass >= HAS_FILE_PASS && path ? [`- ${line(path, s)}`] : [];
  });
  if (facts.length === 0) return null;

  const about = repo.description && firstSentence(repo.description);
  const intro = [about, repo.language && `Written mainly in ${repo.language}.`].filter(Boolean).join(" ");

  return [
    "# AGENTS.md",
    "",
    `Guidance for AI coding agents working in ${repo.owner}/${repo.name}.${intro ? ` ${intro}` : ""}`,
    "",
    "## Where things are",
    "",
    ...facts,
    "",
    "## Commands",
    "",
    "<!-- Fill in the exact commands CI runs. -->",
    "- Install: TODO",
    "- Test: TODO",
    "- Lint: TODO",
    "",
  ].join("\n");
}

/** The starter, only for a repo without a usable AGENTS.md or CLAUDE.md. */
export function starterIfMissing(
  data: AgentInstructionsData | null,
  repo: Repo,
  signals: SignalResult[],
): string | null {
  return data && (!data.main || data.main.state === "empty") ? starterAgentsMd(repo, signals) : null;
}

export type CompanionFile = {
  agent: string;
  /** What to do for this agent; `file` and `text` only when it needs a file of its own. */
  note: string;
  file?: string;
  text?: string;
  source: string;
};

// Each `note` restates its `source`, so check there before rewording.
export const COMPANION_FILES: CompanionFile[] = [
  {
    agent: "Claude Code",
    note: "From v2.1.277 it reads AGENTS.md itself, but only when there is no CLAUDE.md. If you keep one, have it import AGENTS.md; that never loads the file twice.",
    file: "CLAUDE.md",
    text: "@AGENTS.md\n",
    source: "https://code.claude.com/docs/en/memory",
  },
  {
    agent: "Gemini CLI",
    note: "Reads GEMINI.md by default. List AGENTS.md in `context.fileName` in a committed project settings file.",
    file: VS_AGENTS_MD.gemini_md.snippet.caption,
    text: VS_AGENTS_MD.gemini_md.snippet.text,
    source: "https://geminicli.com/docs/cli/gemini-md/",
  },
  {
    agent: "GitHub Copilot",
    note: "Its cloud agent, code review, CLI and VS Code chat read AGENTS.md. No extra file needed.",
    source: "https://docs.github.com/en/copilot/reference/custom-instructions-support",
  },
  {
    agent: "Cursor",
    note: "Reads AGENTS.md at the root and in subdirectories. Add `.cursor/rules/*.mdc` only for rules scoped to some files.",
    source: "https://cursor.com/docs/context/rules",
  },
  {
    agent: "Codex",
    note: "Reads AGENTS.md before any work. No extra file needed.",
    source: "https://learn.chatgpt.com/docs/agent-configuration/agents-md",
  },
];

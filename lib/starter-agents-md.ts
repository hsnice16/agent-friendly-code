import type { SignalResult } from "@/lib/scoring/signals";

import { HAS_FILE_PASS } from "./utils/agent-instructions";

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
    // Below a full pass the check found no test directory and names one test file, not where the tests live.
    line: (p, s) => (s.pass < 1 ? `Test files are spread through the tree, e.g. \`${p}\`.` : `Tests live in \`${p}\`.`),
  },
  { id: "linter", line: (p) => `Lint and format rules are configured in \`${p}\`.` },
  { id: "type_config", line: (p) => `Type checking is configured in \`${p}\`.` },
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
    return s && s.pass >= HAS_FILE_PASS && s.matchedPath ? [`- ${line(s.matchedPath, s)}`] : [];
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

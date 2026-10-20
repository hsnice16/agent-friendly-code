import type { SignalResult } from "@/lib/scoring/signals";

import { HAS_FILE_PASS } from "./utils/agent-instructions";

type Repo = { owner: string; name: string; language: string | null; description?: string | null };

// Paths only: the checks record where a file is, never what it runs, so every
// command is left for the owner to fill in rather than guessed from the path.
const FACTS: { id: string; line: (path: string) => string }[] = [
  { id: "deps_manifest", line: (p) => `Dependencies are declared in \`${p}\`.` },
  { id: "tests", line: (p) => `Tests live in \`${p}\`.` },
  { id: "linter", line: (p) => `Lint rules are configured in \`${p}\`.` },
  { id: "type_config", line: (p) => `Type checking is configured in \`${p}\`.` },
  { id: "ci", line: (p) => `CI is defined in \`${p}\`; read it for the exact install, lint and test steps.` },
  { id: "pre_commit", line: (p) => `Commit hooks are set up in \`${p}\`; don't skip them.` },
  { id: "dev_env", line: (p) => `A reproducible environment is defined in \`${p}\`.` },
  { id: "contributing", line: (p) => `Follow the conventions in \`${p}\`.` },
];

/** A starter AGENTS.md from what the checks found. Null when the checks found nothing to say. */
export function starterAgentsMd(repo: Repo, signals: SignalResult[]): string | null {
  const byId = new Map(signals.map((s) => [s.id, s]));
  const facts = FACTS.flatMap(({ id, line }) => {
    const s = byId.get(id);
    return s && s.pass >= HAS_FILE_PASS && s.matchedPath ? [`- ${line(s.matchedPath)}`] : [];
  });
  if (facts.length === 0) return null;

  const about = repo.description && (/[.!?…]$/.test(repo.description) ? repo.description : `${repo.description}.`);
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

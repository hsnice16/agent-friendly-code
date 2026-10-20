// The /check/agents-md answer to "what should I put in an AGENTS.md?". Every
// item is something an agent can't work out from the code, or gets wrong when
// it tries; that test is what keeps items off the list too.
export const AGENTS_MD_INCLUDE: { label: string; text: string }[] = [
  {
    label: "What the project is",
    text: "A sentence or two, plus languages, frameworks and package manager (`pnpm`, not npm; `uv`, not pip).",
  },
  {
    label: "Exact commands",
    text: "Setup, build, test, lint and type check, copy-pasteable with flags. Include how to run one test file; an agent runs that most.",
  },
  {
    label: "Where things are",
    text: "Only what a directory listing doesn't say: where generated code and fixtures live, which package is the entry point.",
  },
  {
    label: "Rules a reviewer would repeat",
    text: "Conventions the linter doesn't enforce: naming, error handling, which module owns database access.",
  },
  {
    label: "Boundaries",
    text: "What never to touch (generated files, lockfiles, secrets) and what to ask about first (migrations, new dependencies).",
  },
  {
    label: "When a change is done",
    text: "The checks that must pass first, usually the ones CI runs.",
  },
];

export const AGENTS_MD_LEAVE_OUT: string[] = [
  "Style rules a linter or formatter already enforces.",
  "A full file tree: it goes stale, and the agent can list the directory.",
  "Secrets, tokens or internal URLs: the file is committed.",
  "Long how-tos for one part of the code. Link a doc, or put an AGENTS.md in that directory.",
];

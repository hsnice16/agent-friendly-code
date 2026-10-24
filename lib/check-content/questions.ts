import type { CheckQuestions } from "./types";

// Phrased as the searches these pages answer, per check rather than templated:
// the subjects take different articles and verbs ("add a test suite", "keep a
// codebase manageable"). `scoring` asks "what makes a good …" only where the
// check grades content; presence-only checks ask "what counts as …".
export const CHECK_QUESTIONS: Record<string, CheckQuestions> = {
  agents_md: {
    pass: "How many repos have an AGENTS.md?",
    why: "Why do AI coding agents need an AGENTS.md?",
    scoring: "What makes a good AGENTS.md?",
    fix: "How do I add an AGENTS.md to my repo?",
    agents: "Which AI agents read AGENTS.md?",
  },
  cursor_rules: {
    pass: "How many repos have Cursor rules?",
    why: "Why does Cursor need project rules?",
    scoring: "What counts as Cursor rules?",
    fix: "How do I add Cursor rules to my repo?",
    agents: "Which AI agents read Cursor rules?",
  },
  gemini_md: {
    pass: "How many repos have a GEMINI.md?",
    why: "Why does Gemini CLI need a GEMINI.md?",
    scoring: "What makes a good GEMINI.md?",
    fix: "How do I add a GEMINI.md to my repo?",
    agents: "Which AI agents read GEMINI.md?",
  },
  openhands_setup: {
    pass: "How many repos have an OpenHands setup script?",
    why: "Why does OpenHands need a setup script?",
    scoring: "What counts as an OpenHands setup script?",
    fix: "How do I add .openhands/setup.sh to my repo?",
    agents: "Which AI agents read .openhands/setup.sh?",
  },
  aider_conf: {
    pass: "How many repos have an .aider.conf.yml?",
    why: "Why does Aider need an .aider.conf.yml?",
    scoring: "What makes a useful Aider config?",
    fix: "How do I add an .aider.conf.yml to my repo?",
    agents: "Which AI agents read .aider.conf.yml?",
  },
  agent_skills: {
    pass: "How many repos ship agent skills?",
    why: "Why add agent skills to a repo?",
    scoring: "What counts as an agent skill?",
    fix: "How do I add agent skills to my repo?",
    agents: "Which AI agents load .agents/skills?",
  },
  readme: {
    pass: "How many repos have a detailed README?",
    why: "Why do AI coding agents need a detailed README?",
    scoring: "What makes a good README for AI agents?",
    fix: "How do I write a README AI agents can use?",
    agents: "Which AI coding agents weigh the README most?",
  },
  tests: {
    pass: "How many repos have a test suite?",
    why: "Why do AI coding agents need tests?",
    scoring: "What counts as a test suite?",
    fix: "How do I make tests easy for AI agents to find?",
    agents: "Which AI coding agents weigh tests most?",
  },
  ci: {
    pass: "How many repos have CI?",
    why: "Why do AI coding agents need CI?",
    scoring: "What counts as CI configuration?",
    fix: "How do I add CI to my repo?",
    agents: "Which AI coding agents weigh CI most?",
  },
  linter: {
    pass: "How many repos commit a linter or formatter config?",
    why: "Why do AI coding agents need a linter config?",
    scoring: "What counts as a linter or formatter config?",
    fix: "How do I add a linter config to my repo?",
    agents: "Which AI coding agents weigh a linter config most?",
  },
  deps_manifest: {
    pass: "How many repos have a dependency manifest?",
    why: "Why do AI coding agents need a dependency manifest?",
    scoring: "What counts as a dependency manifest?",
    fix: "How do I add a dependency manifest to my repo?",
    agents: "Which AI coding agents weigh a dependency manifest most?",
  },
  dev_env: {
    pass: "How many repos have a reproducible dev environment?",
    why: "Why do AI coding agents need a reproducible dev environment?",
    scoring: "What makes a dev environment reproducible?",
    fix: "How do I make my dev environment reproducible?",
    agents: "Which AI coding agents weigh a reproducible dev environment most?",
  },
  type_config: {
    pass: "How many repos have static type checking?",
    why: "Why do static types help AI coding agents?",
    scoring: "What counts as type configuration?",
    fix: "How do I add type checking to my repo?",
    agents: "Which AI coding agents weigh static types most?",
  },
  license: {
    pass: "How many repos have a license file?",
    why: "Why does a license file matter for AI coding agents?",
    scoring: "What counts as a license file?",
    fix: "How do I add a license file to my repo?",
    agents: "Which AI coding agents weigh a license file most?",
  },
  contributing: {
    pass: "How many repos have a CONTRIBUTING guide?",
    why: "Why do AI coding agents need a CONTRIBUTING guide?",
    scoring: "What counts as a CONTRIBUTING guide?",
    fix: "How do I add a CONTRIBUTING guide to my repo?",
    agents: "Which AI coding agents weigh a CONTRIBUTING guide most?",
  },
  pre_commit: {
    pass: "How many repos use pre-commit hooks?",
    why: "Why do pre-commit hooks help AI coding agents?",
    scoring: "What counts as pre-commit hooks?",
    fix: "How do I add pre-commit hooks to my repo?",
    agents: "Which AI coding agents weigh pre-commit hooks most?",
  },
  size: {
    pass: "How many repos are a manageable size for AI agents?",
    why: "Why do large codebases slow AI coding agents down?",
    scoring: "What codebase size works best for AI agents?",
    fix: "How do I help AI agents in a large codebase?",
    agents: "Which AI coding agents weigh codebase size most?",
  },
};

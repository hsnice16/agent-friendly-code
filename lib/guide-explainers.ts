// The /guide's closing answers, for the searches that land there in other words
// ("AI-ready codebase", "LLM-friendly code", "context engineering"). Each is
// framed by what we check, so it can't drift into claims we don't measure.
export type Explainer = { question: string; answer: string; link: { href: string; label: string } };

export function guideExplainers(checks: number): Explainer[] {
  return [
    {
      question: "What is an AI-ready codebase?",
      answer: `An AI-ready, or agent-friendly, codebase is one an AI coding agent can work in without guessing: it writes down how to build, test and change the project, and lets the agent check its own work. LLM-friendly code is the same idea from the model's side. We measure it with ${checks} checks, from AGENTS.md and tests to CI, lint and type config, a dependency manifest, a reproducible dev environment and a size an agent's context can hold.`,
      link: { href: "/check", label: `All ${checks} checks` },
    },
    {
      question: "What is context engineering for a codebase?",
      answer:
        "Choosing what an agent reads, and when. AGENTS.md, CLAUDE.md and GEMINI.md load on every task, so keep them to what applies everywhere. A nested AGENTS.md, a Cursor rule scoped by `globs` and a skill in `.agents/skills/` load only for the code or task they cover. Tests, CI and lint config then tell the agent whether it got it right, which no prose can.",
      link: { href: "/agents", label: "What each agent loads" },
    },
  ];
}

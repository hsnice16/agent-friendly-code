import type { Guide } from "./types";

export const CODING_AGENT_BENCHMARKS: Guide = {
  slug: "coding-agent-benchmarks",
  name: "Coding agent benchmarks",
  title: "Coding agent benchmarks: what SWE-bench and others measure",
  description:
    "What SWE-bench Verified, SWE-Bench Pro, Terminal-Bench, Aider Polyglot and Multi-SWE-bench test: tasks, languages, scoring, and what none of them rank.",
  lead: "Coding agent benchmarks run a model, usually inside an agent harness, on a fixed set of tasks and count how many it solves: SWE-bench and its successors use real GitHub issues, Terminal-Bench uses terminal tasks, Aider Polyglot uses programming exercises. They rank models and agents, not how well your repo is set up for one.",
  published: "2026-11-16",
  updated: "2026-11-16",
  about: ["SWE-bench", "Terminal-Bench", "Aider Polyglot", "Multi-SWE-bench", "AI coding agents", "Benchmarks"],
  sections: [
    {
      id: "what-they-measure",
      heading: "What do coding agent benchmarks measure?",
      blocks: [
        {
          kind: "p",
          text: "Each fixes the tasks and repos, then varies the model or agent. The score is the share of tasks solved, usually checked by tests written for each task. That makes results comparable across models, and means every number describes the benchmark's repos, not yours.",
        },
      ],
    },
    {
      id: "table",
      heading: "How do SWE-bench, Terminal-Bench and the others compare?",
      blocks: [
        {
          kind: "table",
          caption: "Popular coding agent benchmarks: size, languages and what each scores",
          head: ["Benchmark", "Tasks", "Languages", "What it tests"],
          rows: [
            [
              "SWE-bench Verified",
              "500, a human-validated subset of SWE-bench's 2,294 issues from 12 repos",
              "Python",
              "Resolving a real GitHub issue; the fix passes when the repo's hidden tests pass",
            ],
            [
              "SWE-Bench Pro (Scale AI)",
              "1,865 across 41 professional repos: 731 public, 276 commercial from 18 startup codebases, 858 held out",
              "Results reported for Go, Python, JavaScript and TypeScript",
              "Long-horizon, multi-file changes (bugs, features, security updates); resolved when the new tests pass and the old ones still do. Built to resist contamination",
            ],
            [
              "Terminal-Bench 2.0",
              "89 hard tasks in terminal environments",
              "Not language-specific",
              "Completing a task in its own terminal environment, verified by tests written for it",
            ],
            [
              "Aider Polyglot",
              "225 hard Exercism exercises",
              "C++, Go, Java, JavaScript, Python, Rust",
              "Whether an LLM can follow instructions and edit code to solve each exercise without human help",
            ],
            [
              "Multi-SWE-bench",
              "1,632 instances checked by 68 expert annotators; flash (300) and mini (400) variants",
              "Java, TypeScript, JavaScript, Go, Rust, C, C++",
              "Issue resolution, as in SWE-bench, beyond Python",
            ],
          ],
        },
        {
          kind: "p",
          text: "tbench.ai's leaderboard shows a version later than 2.0, so check which one a quoted score used.",
        },
      ],
    },
    {
      id: "swe-vs-terminal",
      heading: "SWE-bench vs Terminal-Bench: what's the difference?",
      blocks: [
        {
          kind: "p",
          text: "SWE-bench hands the agent a repository and an issue and checks the patch with tests. Terminal-Bench gives it a terminal environment and a task drawn from real workflows, checked by tests written for that task. One measures reading and fixing an existing codebase; the other, getting work done through the command line. An agent can do well on one and poorly on the other.",
        },
      ],
    },
    {
      id: "languages",
      heading: "Which languages does SWE-bench cover?",
      blocks: [
        {
          kind: "p",
          text: "Only Python: the original SWE-bench, and so Verified, comes from 12 popular Python repositories. For other languages see Multi-SWE-bench (seven languages), SWE-Bench Pro (results for Go, Python, JavaScript and TypeScript) or Aider Polyglot (six languages, on exercises rather than repos). A model's Python issue-fixing score says little about how it handles your Rust or Java.",
        },
      ],
    },
    {
      id: "read-a-leaderboard",
      heading: "How should I read an AI coding agent leaderboard?",
      tone: "tip",
      blocks: [
        {
          kind: "list",
          items: [
            "Check what was run: a bare model, or a model inside a particular agent. The same model scores differently in different harnesses.",
            "Check the version and subset: SWE-bench Verified is not SWE-bench, and Terminal-Bench 2.0 is not its later versions.",
            "Check the languages against yours.",
            "Treat small gaps as noise; a few tasks either way can reorder the top.",
            "Leaders change often: read the benchmark's own site, not a quoted number.",
          ],
        },
      ],
    },
    {
      id: "repo-side",
      heading: "What do benchmarks leave out?",
      tone: "info",
      blocks: [
        {
          kind: "p",
          text: "Your repo. A benchmark holds the codebase fixed and asks which agent is best. In your work the agent is usually fixed and the codebase varies: an AGENTS.md, tests the agent can run, CI, a linter, a reproducible dev setup. Those decide how much of a model's benchmark score you get.",
        },
        {
          kind: "p",
          text: "Our leaderboard asks that second question. It scores {{boardSize}} public repos, once per agent for {{agents}} agents, on file checks weighted by what each agent's docs say it reads. No agent is run, so it measures whether the scaffolding agents rely on is there, not outcomes. The methodology page lists every check and weight.",
        },
      ],
    },
    {
      id: "use-both",
      heading: "How do a benchmark score and a repo score fit together?",
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "Use benchmarks to shortlist models and agents by the closest task type and language to your work.",
            "Use a repo score to see what your codebase is missing for the agent you picked: an instructions file it actually reads, runnable tests, setup.",
            "Fix the repo side first if it's weak: it helps every agent, and doesn't change when the leaderboard does.",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "What is SWE-bench Verified?",
      a: "A human-validated subset of 500 SWE-bench tasks: real GitHub issues from Python repositories, each checked by the repo's tests.",
    },
    {
      q: "Is SWE-bench only Python?",
      a: "Yes, SWE-bench and SWE-bench Verified are Python only. Multi-SWE-bench covers seven other languages, and SWE-Bench Pro reports Go, JavaScript and TypeScript as well as Python.",
    },
    {
      q: "Who is top of the coding agent leaderboards?",
      a: "It changes too often to state here. Each benchmark's site (swebench.com, Scale's SWE-Bench Pro page, tbench.ai, Aider's leaderboard) has the current table.",
    },
    {
      q: "Does a higher benchmark score mean an agent will do better in my repo?",
      a: "Only if your tasks resemble the benchmark's, and your repo gives the agent what it needs: instructions, tests it can run, a working setup.",
    },
    {
      q: "Is Agent Friendly Code a benchmark?",
      a: "No. It ranks repos, not agents, by checking files; no agent is run. It complements benchmarks.",
    },
  ],
  sources: [
    "https://www.swebench.com/verified.html",
    "https://www.swebench.com/original.html",
    "https://labs.scale.com/leaderboard/swe_bench_pro_public",
    "https://arxiv.org/abs/2601.11868",
    "https://www.tbench.ai/news/announcement-2-0",
    "https://aider.chat/docs/leaderboards/",
    "https://github.com/multi-swe-bench/multi-swe-bench",
  ],
  related: [
    { href: "/methodology", label: "How we score repos" },
    { href: "/", label: "The leaderboard" },
    { href: "/score", label: "Score your repo" },
    { href: "/check", label: "Every check we run" },
    { href: "/check/agents-md", label: "Check your AGENTS.md" },
    { href: "/agents", label: "What each agent reads" },
  ],
};

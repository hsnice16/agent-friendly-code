import type { Guide } from "./types";

export const CODING_AGENT_BENCHMARKS: Guide = {
  slug: "coding-agent-benchmarks",
  name: "Coding agent benchmarks",
  title: "Coding agent benchmarks: what SWE-bench and others measure",
  description:
    "What SWE-bench Verified, SWE-Bench Pro, Terminal-Bench, Aider Polyglot and Multi-SWE-bench test, how our agents rank there, and what setup can't change.",
  lead: "Coding agent benchmarks run a model, usually inside an agent harness, on a fixed set of tasks and count how many it solves: SWE-bench and its successors use real GitHub issues, Terminal-Bench uses terminal tasks, Aider Polyglot uses programming exercises. They rank models and agents on the benchmark's own repos, not how well yours is set up for one.",
  published: "2026-11-16",
  updated: "2026-11-25",
  about: [
    "SWE-bench",
    "Terminal-Bench",
    "Aider Polyglot",
    "Multi-SWE-bench",
    "AI coding agents",
    "Benchmarks",
    "AGENTS.md",
  ],
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
              "Resolving a real GitHub issue; the fix passes when the repo's hidden tests pass. OpenAI [stopped reporting it](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/) in February 2026, citing contamination",
            ],
            [
              "SWE-Bench Pro (Scale AI)",
              "1,865 across 41 professional repos: 731 public, 276 private from 18 proprietary startup codebases, 858 held out",
              "Results reported for Go, Python, JavaScript and TypeScript",
              "Long-horizon, multi-file changes; resolved when the new tests pass and the old ones still do. Public and held-out repos use strong copyleft licenses such as the GPL, to reduce contamination",
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
          text: "tbench.ai's leaderboard now shows Terminal-Bench 4.1: [4.0](https://www.tbench.ai/news/terminal-bench-4-0) removed saturated tasks and [4.1](https://www.tbench.ai/news/terminal-bench-4-1) fixed the verifiers. Check which version a quoted score used.",
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
            "Check the version and subset: SWE-bench Verified is not SWE-bench, and Terminal-Bench 2.0 is not 4.1.",
            "Check the languages against yours.",
            "Treat small gaps as noise; a few tasks either way can reorder the top.",
            "Check the date: Aider's leaderboard was last updated in November 2025, and SWE-bench Verified's newest entry is from February 2026.",
            "Leaders change often: read the benchmark's own site, not a quoted number.",
          ],
        },
      ],
    },
    {
      id: "agents-on-the-board",
      heading: "Where do the agents we score stand on benchmarks?",
      blocks: [
        {
          kind: "p",
          text: "Terminal-Bench 4.1 lists each entry by agent and model; of the {{agents}} agents on our leaderboard, only Claude Code and Codex appear there. SWE-Bench Pro runs models in its own research scaffolds (SWE-agent, some mini-SWE-agent), so it ranks no agents. The board columns score setup files in public repos; no task is run, so they are not a benchmark result.",
        },
        {
          kind: "agentBoard",
          checked: "2026-11-25",
          benchmarks: {
            "claude-code": "Terminal-Bench 4.1: 65.8% (Opus 5.5 or Fable 5.2), second to GitHub Copilot's 71.2%",
            "gpt-5-codex": "Terminal-Bench 4.1: 62.1% (GPT-6.2 Astra)",
            "kimi-cli":
              "Not listed. Moonshot's Kimi K3.1 Pro model scores 59.7% on Terminal-Bench 4.1 inside Claude Code",
            pi: "Not on the SWE-bench, Terminal-Bench or Aider leaderboards",
            devin: "Not on the SWE-bench, Terminal-Bench or Aider leaderboards",
            aider: "Every Aider Polyglot entry runs in Aider: best 88.0% (gpt-5, high)",
            cursor: "Not on the SWE-bench, Terminal-Bench or Aider leaderboards",
            "gemini-cli": "Not listed. Google's Terminal-Bench 4.1 entries use Antigravity CLI: best 64.5%",
            openhands: "SWE-bench Verified: 71.8% with GPT-5 (August 2025). Not on Terminal-Bench 4.1",
          },
        },
        {
          kind: "p",
          text: "Its own file means a file only that agent reads in full, else CLAUDE.md for Claude Code, else AGENTS.md. A repo with both AGENTS.md and CLAUDE.md counts under AGENTS.md, and empty files don't count.",
        },
      ],
    },
    {
      id: "repo-side",
      heading: "Can repo setup change a benchmark score?",
      tone: "info",
      blocks: [
        {
          kind: "p",
          text: "Not the published one. A benchmark fixes the repos and prompts and varies the agent, so your AGENTS.md, tests and CI never enter it, and none of the five reports what an instructions file changes. In your work the agent is usually fixed and the codebase varies.",
        },
        {
          kind: "p",
          text: "Studies that add the file point different ways. Across 124 pull requests in 10 repos, an AGENTS.md cut median runtime by 28.64% and output tokens by 16.58%, with task completion comparable ([arXiv 2601.20404](https://arxiv.org/abs/2601.20404)). On SWE-bench tasks and on repos with developer-written files, context files did not generally raise success and added over 20% to inference cost ([arXiv 2602.11988](https://arxiv.org/abs/2602.11988)).",
        },
        {
          kind: "p",
          text: "Our scores don't settle it either. We score {{boardSize}} public repos per agent on file checks weighted by each agent's docs; no agent is run, and the weights are [not yet tested](/methodology) against real runs. A score says whether the scaffolding an agent's docs ask for is there, not how much it helps.",
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
            "Fix the repo side if it's weak: it applies to every agent, and doesn't change when the leaderboard does.",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Is SWE-bench Verified still a good benchmark?",
      a: "OpenAI stopped reporting it in February 2026: models had seen some tasks in training, and 59.4% of the 138 problems it audited had flawed tests or descriptions. It recommends SWE-Bench Pro.",
    },
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
      a: "On 2026-11-25 GitHub Copilot led Terminal-Bench 4.1 at 71.2%, with Claude Code second at 65.8%. It changes often: each benchmark's site (swebench.com, Scale's SWE-Bench Pro page, tbench.ai, Aider's leaderboard) has the current table.",
    },
    {
      q: "Does an AGENTS.md improve benchmark scores?",
      a: "The benchmarks don't measure it. One study found an AGENTS.md cut runtime and output tokens with similar task completion; another found context files didn't generally raise success and cost over 20% more.",
    },
    {
      q: "Does a higher benchmark score mean an agent will do better in my repo?",
      a: "Only if your tasks resemble the benchmark's, and your repo gives the agent what it needs: instructions, tests it can run, a working setup.",
    },
    {
      q: "Is Agent Friendly Code a benchmark?",
      a: "No. It ranks repos, not agents, by checking files; no agent is run, and its weights are not yet tested against real runs.",
    },
  ],
  sources: [
    "https://www.swebench.com/verified.html",
    "https://www.swebench.com/original.html",
    "https://www.swebench.com/",
    "https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/",
    "https://labs.scale.com/leaderboard/swe_bench_pro",
    "https://arxiv.org/abs/2601.11868",
    "https://www.tbench.ai/news/announcement-2-0",
    "https://www.tbench.ai/news/terminal-bench-4-0",
    "https://www.tbench.ai/news/terminal-bench-4-1",
    "https://www.tbench.ai/",
    "https://aider.chat/docs/leaderboards/",
    "https://github.com/multi-swe-bench/multi-swe-bench",
    "https://arxiv.org/abs/2601.20404",
    "https://arxiv.org/abs/2602.11988",
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

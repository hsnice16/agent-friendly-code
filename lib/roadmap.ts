export type RoadmapItem = {
  title: string;
  summary: string;
  taskFile?: string;
};

export type RoadmapVersion = {
  theme: string;
  version: string;
  items: RoadmapItem[];
  status: "planned" | "in_progress";
};

export const ROADMAP: RoadmapVersion[] = [
  {
    version: "0.5.0",
    status: "planned",
    theme: "Quick wins",
    items: [
      {
        title: "History-aware signals",
        taskFile: "tasks/0.5.0/01-history-aware-signals.md",
        summary:
          "Score maintenance recency, commit velocity, and contributor activity — the gap left by the --depth 1 --single-branch clone. Served via host APIs, degrades gracefully without a token.",
      },
      {
        title: "Score diff on PR",
        taskFile: "tasks/0.5.0/02-score-diff-on-pr.md",
        summary: "GitHub Action that comments score delta on every PR.",
      },
      {
        title: "Agent skill",
        taskFile: "tasks/0.5.0/03-agent-skill.md",
        summary:
          "Portable skill (installable via npx skills add into Claude Code, Codex, Cursor, Cline, Copilot, …) that scores the user's current repo locally and recommends a model. Sibling repo vendors the scorer; no service dependency, works offline. Ships with a UI integration page and SessionStart hook snippets for agents that support them.",
      },
    ],
  },
  {
    version: "0.6.0",
    status: "planned",
    theme: "Auto-refresh + smarter matching",
    items: [
      {
        title: "Webhook-driven rescoring",
        taskFile: "tasks/0.6.0/01-webhook-rescoring.md",
        summary: "Keep scores fresh on every push; detect regressions.",
      },
      {
        title: "Alternatives via README embeddings",
        taskFile: "tasks/0.6.0/02-alternatives-v2-embeddings.md",
        summary: "Upgrade the v1 SQL heuristic with sentence-transformer embeddings for cross-language matches.",
      },
    ],
  },
  {
    version: "0.7.0",
    status: "planned",
    theme: "Maintainer ownership + at-scale discovery",
    items: [
      {
        title: "Opt-out / claim flow",
        taskFile: "tasks/0.7.0/01-opt-out-claim-flow.md",
        summary: "OAuth so maintainers control their listing.",
      },
      {
        title: "Package-registry overlay (at scale)",
        taskFile: "tasks/0.7.0/02-package-registry-overlay.md",
        summary: "Per-registry leaderboards + browser userscript for inline badges on npmjs.com / PyPI / crates.io.",
      },
    ],
  },
  {
    version: "1.0.0",
    status: "planned",
    theme: "Production cut",
    items: [
      {
        title: "Postgres migration",
        taskFile: "tasks/1.0.0/01-postgres-migration.md",
        summary: "Leave SQLite behind when concurrent writers arrive.",
      },
      {
        title: "At-scale indexing",
        taskFile: "tasks/1.0.0/02-at-scale-indexing.md",
        summary:
          "Auto-discover and rank a large slice of public GitHub (search + trending + submissions) instead of a curated seed list. Target 10k repos for v1.0.0.",
      },
      {
        title: "Benchmark harness",
        taskFile: "tasks/1.0.0/03-benchmark-harness.md",
        summary: "Actually run agents on scoped tasks per repo; derive weights from measured success.",
      },
    ],
  },
];

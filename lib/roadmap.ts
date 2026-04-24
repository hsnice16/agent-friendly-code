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

// As an item ships, move it from here to lib/changelog.ts in the same PR —
// moved, not duplicated. See CONTRIBUTING.md for the workflow.
export const ROADMAP: RoadmapVersion[] = [
  {
    version: "0.3.0",
    status: "planned",
    theme: "Real per-model weights",
    items: [
      {
        title: "Benchmark harness",
        taskFile: "tasks/0.3.0/01-benchmark-harness.md",
        summary: "Actually run agents on scoped tasks per repo; derive weights from measured success.",
      },
    ],
  },
  {
    version: "0.4.0",
    status: "planned",
    theme: "Ecosystem integration",
    items: [
      {
        title: "Badge endpoint",
        taskFile: "tasks/0.4.0/01-badge-endpoint.md",
        summary: "/badge/:host/:owner/:name.svg for READMEs.",
      },
      {
        title: "Score diff on PR",
        taskFile: "tasks/0.4.0/02-score-diff-on-pr.md",
        summary: "GitHub Action that comments score delta on every PR.",
      },
      {
        title: "Webhook-driven rescoring",
        taskFile: "tasks/0.4.0/03-webhook-rescoring.md",
        summary: "Keep scores fresh on every push; detect regressions.",
      },
      {
        title: "Opt-out / claim flow",
        taskFile: "tasks/0.4.0/04-opt-out-claim-flow.md",
        summary: "OAuth so maintainers control their listing.",
      },
    ],
  },
  {
    version: "0.5.0",
    status: "planned",
    theme: "Discovery — alternatives",
    items: [
      {
        title: "Alternative recommender",
        taskFile: "tasks/0.5.0/01-alternative-recommender.md",
        summary: '"Repo Y does the same thing and ranks higher for your model."',
      },
    ],
  },
  {
    version: "0.6.0",
    status: "planned",
    theme: "Discovery — package registries",
    items: [
      {
        title: "Package-registry overlay",
        taskFile: "tasks/0.6.0/01-package-registry-overlay.md",
        summary: "Rank npm / PyPI / Cargo packages by source-repo friendliness.",
      },
    ],
  },
  {
    version: "0.7.0",
    status: "planned",
    theme: "History-aware signals",
    items: [
      {
        title: "History-aware signals",
        taskFile: "tasks/0.7.0/01-history-aware-signals.md",
        summary:
          "Score maintenance recency, commit velocity, and contributor activity — the gap left by the --depth 1 --single-branch clone. Served via host APIs, degrades gracefully without a token.",
      },
    ],
  },
  {
    version: "1.0.0",
    status: "planned",
    theme: "Production stability",
    items: [
      {
        title: "Postgres migration",
        taskFile: "tasks/1.0.0/01-postgres-migration.md",
        summary: "Leave SQLite behind when concurrent writers arrive.",
      },
    ],
  },
  {
    version: "1.1.0",
    status: "planned",
    theme: "At-scale GitHub indexing",
    items: [
      {
        title: "At-scale indexing",
        taskFile: "tasks/1.1.0/01-at-scale-indexing.md",
        summary:
          "Auto-discover and rank a large slice of public GitHub (search + trending + submissions) instead of a curated seed list. Target 10k repos for v1.1.0.",
      },
    ],
  },
];

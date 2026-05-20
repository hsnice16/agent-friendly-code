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

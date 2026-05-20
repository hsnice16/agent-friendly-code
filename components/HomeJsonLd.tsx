import type { LeaderboardRow } from "@/lib/types/db";
import { APP_URL } from "@/lib/version";

type HomeJsonLdProps = {
  allOverall: LeaderboardRow[];
  lastScoredAt: number | null;
};

export function HomeJsonLd({ allOverall, lastScoredAt }: HomeJsonLdProps) {
  const lastModified = lastScoredAt != null ? new Date(lastScoredAt * 1000).toISOString() : new Date().toISOString();

  const json = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": `${APP_URL}/#leaderboard`,
        numberOfItems: allOverall.length,
        name: "Agent-friendliness leaderboard",
        itemListElement: allOverall.map((row, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: `${row.owner}/${row.name}`,
          url: `${APP_URL}/repo/${row.id}`,
        })),
      },
      {
        "@type": "Dataset",
        "@id": `${APP_URL}/#dataset`,
        name: "Agent Friendly Code — public repository scoring dataset",
        description:
          "Per-model agent-friendliness scores for public repositories on GitHub, GitLab, and Bitbucket, evaluated against sixteen static signals — twelve cross-agent (AGENTS.md, CI, tests, README, linter, type config, license, contributing, dev env, pre-commit, deps manifest, size) plus four agent-specific instruction files (.cursor/rules/, GEMINI.md, .openhands/setup.sh, .aider.conf.yml) — for Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Aider, OpenHands, and Pi.",
        url: APP_URL,
        isAccessibleForFree: true,
        dateModified: lastModified,
        creator: { "@id": `${APP_URL}/#org` },
        license: "https://opensource.org/licenses/MIT",
        mainEntity: { "@id": `${APP_URL}/#leaderboard` },
        variableMeasured: [
          "License",
          "Test suite",
          "Codebase size",
          "README quality",
          "CI configuration",
          "Contributing guide",
          "Type configuration",
          "Dependency manifest",
          "Pre-commit / git hooks",
          "Linter / formatter config",
          "Reproducible dev environment",
          "AGENTS.md / CLAUDE.md presence",
          "Aider config (.aider.conf.yml)",
          "Cursor rules (.cursor/rules/*.mdc)",
          "Gemini CLI instructions (GEMINI.md)",
          "OpenHands setup script (.openhands/setup.sh)",
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: server-built JSON-LD; `<` is escaped
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(json).replace(/</g, "\\u003c"),
      }}
    />
  );
}

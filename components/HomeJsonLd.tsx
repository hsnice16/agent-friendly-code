import type { LeaderboardRow } from "@/lib/types/db";
import { repoPath } from "@/lib/utils/repo-path";
import { APP_URL } from "@/lib/version";

type HomeJsonLdProps = {
  allOverall: LeaderboardRow[];
  contentChangedAt: number | null;
};

export function HomeJsonLd({ allOverall, contentChangedAt }: HomeJsonLdProps) {
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
          url: `${APP_URL}${repoPath(row)}`,
        })),
      },
      {
        "@type": "Dataset",
        "@id": `${APP_URL}/#dataset`,
        name: "Agent Friendly Code — public repository scoring dataset",
        description:
          "Scores for public GitHub, GitLab, and Bitbucket repos showing how easy each one is for AI coding agents to work in, with a separate score for Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Kimi CLI, Aider, OpenHands, and Pi. Each repo gets sixteen file checks: twelve that matter to every agent (AGENTS.md, CI, tests, README, linter, type config, license, contributing guide, dev setup, pre-commit, dependency list, size) and four agent-specific instruction files (.cursor/rules/, GEMINI.md, .openhands/setup.sh, .aider.conf.yml).",
        url: APP_URL,
        isAccessibleForFree: true,
        ...(contentChangedAt != null ? { dateModified: new Date(contentChangedAt * 1000).toISOString() } : {}),
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

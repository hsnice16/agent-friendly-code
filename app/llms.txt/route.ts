import { MODELS } from "@/lib/scoring/weights";
import {
  ACTION_REPO_URL,
  APP_DESCRIPTION,
  APP_NAME,
  APP_URL,
  REPO_URL,
  SKILL_INSTALL_CMD,
  SKILL_REPO_URL,
} from "@/lib/version";

export const dynamic = "force-static";

const HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=86400",
};

export function GET(): Response {
  const body = `# ${APP_NAME}

> ${APP_DESCRIPTION}

The scoring engine evaluates sixteen static signals per repository — twelve cross-agent (AGENTS.md / CLAUDE.md, CI configuration, test suite, README, linter / formatter, type config, license, contributing guide, reproducible dev environment, pre-commit hooks, dependency manifest, codebase size) plus four agent-specific instruction files (\`.cursor/rules/*.mdc\` for Cursor, \`GEMINI.md\` for Gemini CLI, \`.openhands/setup.sh\` for OpenHands, \`.aider.conf.yml\` for Aider). Each AI coding agent has its own weight profile across those signals, so the same repository can score differently for different agents.

## Models evaluated

${MODELS.map((m) => `- ${m.label} — ${m.rationale}`).join("\n")}

## Key pages

- [Leaderboard](${APP_URL}/): Per-model leaderboard across GitHub, GitLab, and Bitbucket
- [About](${APP_URL}/about): Who built this, why, and the project's independence statement
- [Action](${APP_URL}/action): PR-diff GitHub Action — install snippet, FAQ, JSON-LD SoftwareApplication
- [Changelog](${APP_URL}/changelog): What shipped per release
- [Methodology](${APP_URL}/methodology): How scores are computed; signals, weights, and limitations
- [Package lookup](${APP_URL}/package): Resolve npm / PyPI / Cargo packages to their source-repo agent-friendliness score
- [Roadmap](${APP_URL}/roadmap): Upcoming versions
- [Skill](${APP_URL}/skill): Portable agent skill — install snippet, score → model mapping, optional SessionStart hooks for Claude Code / Codex
- [Sitemap](${APP_URL}/sitemap.xml): Every indexed URL

## Public API

- [\`GET /api/badge/{host}/{owner}/{name}.svg\`](${APP_URL}/api/badge/github/vercel/next.js.svg): Embeddable SVG badge (\`?model=<id>\` for per-model)
- [\`GET /api/package/{registry}/{name}\`](${APP_URL}/api/package/npm/next): Resolve npm / PyPI / Cargo package → source-repo score
- [\`GET /api/repos\`](${APP_URL}/api/repos): JSON dump of the leaderboard (id, owner, name, host, stars, overall_score, per-model scores)
- [\`GET /api/repo/{id}\`](${APP_URL}/api/repo/1): Per-repo detail — signals, model scores, top improvements
- [\`GET /api/score?host=&repo=owner/name\`](${APP_URL}/api/score?host=github&repo=vercel/next.js): Look up an indexed repo by host + owner/name — public read for external integrators (the PR-diff Action and the agent skill both vendor the scorer locally and don't call this at runtime)

## Tools

- [Agent Friendly Action](${ACTION_REPO_URL}): GitHub Action that posts a per-PR score-delta comment — runs entirely inside the maintainer's CI, opt-in via \`AGENTS_BADGE_TOKEN\`, listed on the GitHub Marketplace
- [Agent Friendly Skill](${SKILL_REPO_URL}): Portable agent skill (Claude Code, Codex, Cursor, Cline, Copilot, …) installable via \`${SKILL_INSTALL_CMD}\` — scores the user's current repo locally, no service dependency

## Source

- [Repository](${REPO_URL}): MIT-licensed Next.js app
- [License](https://opensource.org/licenses/MIT): MIT
`;

  return new Response(body, { headers: HEADERS });
}

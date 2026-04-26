import { MODELS } from "@/lib/scoring/weights";
import { APP_DESCRIPTION, APP_NAME, APP_URL, REPO_URL } from "@/lib/version";

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
- [Methodology](${APP_URL}/methodology): How scores are computed; signals, weights, and limitations
- [Roadmap](${APP_URL}/roadmap): Upcoming versions
- [Changelog](${APP_URL}/changelog): What shipped per release
- [Sitemap](${APP_URL}/sitemap.xml): Every indexed URL

## Public API

- [\`GET /api/repos\`](${APP_URL}/api/repos): JSON dump of the leaderboard (id, owner, name, host, stars, overall_score, per-model scores)
- [\`GET /api/repo/{id}\`](${APP_URL}/api/repo/1): Per-repo detail — signals, model scores, top improvements
- [\`GET /api/badge/{host}/{owner}/{name}.svg\`](${APP_URL}/api/badge/github/vercel/next.js.svg): Embeddable SVG badge (\`?model=<id>\` for per-model)
- [\`GET /api/package/{registry}/{name}\`](${APP_URL}/api/package/npm/next): Resolve npm / PyPI / Cargo package → source-repo score

## Source

- [Repository](${REPO_URL}): MIT-licensed Next.js app
- [License](https://opensource.org/licenses/MIT): MIT
`;

  return new Response(body, { headers: HEADERS });
}

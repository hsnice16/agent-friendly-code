import { CONTENTS_REPORT } from "@/lib/agents-md-contents-data";
import { examplesByLanguage } from "@/lib/agents-md-examples";
import { examplesByFramework } from "@/lib/agents-md-frameworks";
import { ADOPTION } from "@/lib/agents-md-report";
import { AI_POLICY } from "@/lib/ai-policy";
import { CHECK_CONTENT } from "@/lib/check-content";
import { VS_AGENTS_MD } from "@/lib/check-content/vs-agents-md";
import { REGISTRIES } from "@/lib/clients/registries";
import { BOARD_CACHE_CONTROL } from "@/lib/constants/cache";
import { getTopPackagesByRegistry } from "@/lib/db";
import { GUIDES } from "@/lib/guides";
import { fillStats, getGuideStats } from "@/lib/guides/stats";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { compareLines, keyFacts, languageLines } from "@/lib/llms-sections";
import { PAGE_COPY } from "@/lib/page-meta";
import { SIGNALS } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { getTopicGroups } from "@/lib/topic-pages";
import { TOPICS_PATH } from "@/lib/topics";
import { checkPath, checkSubPath, frameworkExamplesPath, languageExamplesPath } from "@/lib/utils/check-path";
import { COMPARE_PATH } from "@/lib/utils/compare-path";
import { CONTRIBUTE_PATH } from "@/lib/utils/contribute-path";
import { formatDay } from "@/lib/utils/format";
import { GENERATOR_PATH } from "@/lib/utils/generator-path";
import { guidePath } from "@/lib/utils/guide-path";
import { OTHER_LANGUAGES_PATH } from "@/lib/utils/language";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { PACKAGE_PATH } from "@/lib/utils/package-path";
import { repoPath } from "@/lib/utils/repo-path";
import {
  AI_POLICY_REPORT_PATH,
  CONTENTS_REPORT_CSV_PATH,
  CONTENTS_REPORT_PATH,
  REPORT_CSV_PATH,
  REPORT_PATH,
  REPORT_TITLE,
  SIZE_REPORT_PATH,
  SKILLS_REPORT_CSV_PATH,
  SKILLS_REPORT_PATH,
} from "@/lib/utils/report-path";
import {
  ACTION_REPO_URL,
  APP_DESCRIPTION,
  APP_NAME,
  APP_URL,
  REPO_URL,
  SKILL_INSTALL_CMD,
  SKILL_LISTING_URL,
  SKILL_REPO_URL,
} from "@/lib/version";

export const dynamic = "force-static";

const HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
  "Cache-Control": BOARD_CACHE_CONTROL,
};

const LLMS_TOP_PACKAGES_PER_REGISTRY = 10;

export function GET(): Response {
  const guideStats = getGuideStats();
  const topPackagesSection = REGISTRIES.map((registry) => {
    const rows = getTopPackagesByRegistry(registry, LLMS_TOP_PACKAGES_PER_REGISTRY);
    if (rows.length === 0) {
      return "";
    }
    // The repo page, not /package/…: package pages are noindex pointers to it.
    // The query only returns packages whose source repo is scored, so each has one.
    const lines = rows.map(
      (p) =>
        `- [${registry}/${p.name}](${APP_URL}${repoPath({ host: p.host, owner: p.owner, name: p.repoName })}): source repo ${p.owner}/${p.repoName}, ${p.score.toFixed(1)} / 100`,
    );
    return `### ${registry}\n\n${lines.join("\n")}`;
  })
    .filter(Boolean)
    .join("\n\n");

  // Labels come from host APIs; stripping link syntax keeps one from forging a link.
  const languageLinks = examplesByLanguage(getAgentsMdExamples())
    .map((l) => `[${l.label.replace(/[[\]()\n]/g, "")}](${APP_URL}${languageExamplesPath(l.slug)})`)
    .join(", ");
  const frameworkLinks = examplesByFramework(getAgentsMdExamples())
    .map((f) => `[${f.guide.label}](${APP_URL}${frameworkExamplesPath(f.guide.slug)})`)
    .join(", ");
  const vsLines = Object.entries(VS_AGENTS_MD)
    .map(([id, c]) => `- [${c.name} vs AGENTS.md](${APP_URL}${checkSubPath(id, "vs-agents-md")}): ${c.description}`)
    .join("\n");
  const hasTopics = getTopicGroups().length > 0;

  const body = `# ${APP_NAME}

> ${APP_DESCRIPTION}

Every score comes from ${SIGNALS.length} file checks, listed below; no agent is run. Each AI coding agent weighs the checks by what its own docs say it reads, so one repository can score differently per agent.

${keyFacts()}

## Agents scored for

${MODELS.map((m) => `- [${m.label}](${APP_URL}${modelPath(m.id)}): ${m.rationale}`).join("\n")}

## Checks

${SIGNALS.map((s) => `- [${s.label}](${APP_URL}${checkPath(s.id)}): ${CHECK_CONTENT[s.id].description}`).join("\n")}

## Key pages

- [Leaderboard](${APP_URL}/): Public repos ranked overall and per agent, across GitHub, GitLab, and Bitbucket
- [About](${APP_URL}/about): Who built this, why, and the independence statement
- [Action](${APP_URL}/action): GitHub Action that comments each pull request's score change — install snippet, FAQ
- [Changelog](${APP_URL}/changelog): What shipped per release
- [Guide: make a repo ready for AI coding agents](${APP_URL}/guide): The checks grouped into what to do, with pass rates and links to every check, agent file and tool
- [${REPORT_TITLE}](${APP_URL}${REPORT_PATH}): Share of leaderboard repos with AGENTS.md or CLAUDE.md, from snapshots on most days since ${formatDay(ADOPTION.points[0].date)}; today's split by language and other agent files; CSV (${APP_URL}${REPORT_CSV_PATH})
- [Checks](${APP_URL}/check): Agent-ready codebase checklist — every check: what it looks for, how to pass it, how many leaderboard repos do
- [Which files each agent reads](${APP_URL}/agents): AGENTS.md, CLAUDE.md, GEMINI.md, .cursor/rules and the rest, per agent from its docs, with how many leaderboard repos have each file
- [AGENTS.md vs CLAUDE.md](${APP_URL}${checkSubPath("agents_md", "vs-claude-md")}): Which one to use, which agents read each, and what Claude Code does when a repo has both
${vsLines}
- [AGENTS.md examples](${APP_URL}${checkSubPath("agents_md", "examples")}): Every AGENTS.md and CLAUDE.md on the leaderboard, linked to the file, with length, stars and score${languageLinks ? `; by language: ${languageLinks}` : ""}${frameworkLinks ? `; by framework, with what to put in the file: ${frameworkLinks}` : ""}
${GUIDES.map((g) => `- [${g.name}](${APP_URL}${guidePath(g.slug)}): ${fillStats(g.description, guideStats)}`).join("\n")}
- [Compare agents](${APP_URL}${COMPARE_PATH}): Claude Code vs Cursor, Codex vs Gemini CLI and more: how well leaderboard repos are set up for each, pair by pair (setup, not code quality)
- [AGENTS.md sizes](${APP_URL}${SIZE_REPORT_PATH}): How long real AGENTS.md and CLAUDE.md files are, and how many pass Devin's 16 KiB and Codex's 32 KiB limits
- [What's in an AGENTS.md](${APP_URL}${CONTENTS_REPORT_PATH}): Which sections ${CONTENTS_REPORT.files} real AGENTS.md and CLAUDE.md files have, how many give a test command, and how they point to other files; CSV (${APP_URL}${CONTENTS_REPORT_CSV_PATH})
- [AI contribution policies](${APP_URL}${AI_POLICY_REPORT_PATH}): What ${AI_POLICY.policies.length} open source projects' own policies say about AI-assisted contributions, classified by hand
- [Agent skills in repos](${APP_URL}${SKILLS_REPORT_PATH}): Which popular repos ship SKILL.md files in .agents/skills or .claude/skills, with counts per repo; CSV (${APP_URL}${SKILLS_REPORT_CSV_PATH})
- [Projects to contribute to](${APP_URL}${CONTRIBUTE_PATH}): Open source projects with a CONTRIBUTING guide, tests and CI, by language, ready for agent-assisted work
- [AGENTS.md generator](${APP_URL}${GENERATOR_PATH}): A starter AGENTS.md drafted from a scan of any public GitHub repo
- [Languages](${APP_URL}/language): The leaderboard split by programming language, with each language's most-missed checks and which agent its repos are best set up for
- [Other languages](${APP_URL}${OTHER_LANGUAGES_PATH}): Repos in languages too small for their own hub, grouped by language
${hasTopics ? `- [Topics](${APP_URL}${TOPICS_PATH}): The leaderboard split by repo topic, one ranked page per topic\n` : ""}- [Methodology](${APP_URL}/methodology): How scores are computed: signals, weights, limitations
- [Package lookup](${APP_URL}${PACKAGE_PATH}): Resolve npm / PyPI / Cargo packages to their source-repo agent-friendliness score
- [Live Score](${APP_URL}/score): Score any public GitHub repository on demand, on the leaderboard or not
- [Roadmap](${APP_URL}/roadmap): Upcoming versions
- [Skill](${APP_URL}/skill): Agent skill that scores the repo you are in — install snippet, the agent it is best set up for, score → model class, optional SessionStart hooks for Claude Code / Codex
- [Privacy policy](${APP_URL}/privacy): ${PAGE_COPY["/privacy"].description}
- [Terms of use](${APP_URL}/terms): ${PAGE_COPY["/terms"].description}
- [Sitemap](${APP_URL}/sitemap.xml): Every indexed URL

## Agent comparisons

${compareLines()}

## Languages

${languageLines()}

## Public API

- [\`GET /api/badge/{host}/{owner}/{name}.svg\`](${APP_URL}/api/badge/github/vercel/next.js.svg): Embeddable SVG badge (\`?model=<id>\` for one agent's score)
- [\`GET /api/package/{registry}/{name}\`](${APP_URL}/api/package/npm/next): Resolve npm / PyPI / Cargo package → source-repo score
- [\`GET /api/repos\`](${APP_URL}/api/repos): JSON array of every ranked repo: the repo row plus its overall score
- [\`GET /api/repo/{id}\`](${APP_URL}/api/repo/1): Per-repo detail by internal id — \`{ repo, signals, modelScores }\`
- [\`GET /api/score?host=&repo=owner/name\`](${APP_URL}/api/score?host=github&repo=vercel/next.js): Look up an indexed repo by host + owner/name — public read for integrators (the PR-diff Action and the agent skill vendor the scorer and don't call this)

## Tools

- [Agent Friendly Action](${ACTION_REPO_URL}): GitHub Action that posts a per-PR score-delta comment — runs only in the maintainer's CI, opt-in via \`AGENTS_BADGE_TOKEN\`, listed on the GitHub Marketplace
- [Agent Friendly Skill](${SKILL_REPO_URL}): Portable agent skill (Claude Code, Codex, Cursor, Cline, Copilot, …) installable via \`${SKILL_INSTALL_CMD}\` — scores the current repo locally, no service dependency. Listed on [skills.sh](${SKILL_LISTING_URL})

## Top scored packages

Each links to the score page of the package's source repo.

${topPackagesSection || "_No packages indexed yet._"}

## Source

- [Repository](${REPO_URL}): MIT-licensed Next.js app
- [License](https://opensource.org/licenses/MIT): MIT
`;

  return new Response(body, { headers: HEADERS });
}

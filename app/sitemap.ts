import type { MetadataRoute } from "next";
import { getAgentSkillsReport } from "@/lib/agent-skills-data";
import { CONTENTS_REPORT } from "@/lib/agents-md-contents-data";
import { examplesByLanguage } from "@/lib/agents-md-examples";
import { examplesByFramework } from "@/lib/agents-md-frameworks";
import { ADOPTION } from "@/lib/agents-md-report";
import { AI_POLICY } from "@/lib/ai-policy";
import { LATEST_RELEASE_DATE } from "@/lib/changelog";
import { VS_AGENTS_MD } from "@/lib/check-content/vs-agents-md";
import { COMPARE_PAIRS } from "@/lib/compare-pairs";
import { PRIVACY_UPDATED, TERMS_UPDATED } from "@/lib/constants/legal";
import { getLeaderboardStats, listLeaderboardOverall } from "@/lib/db";
import { GUIDES } from "@/lib/guides";
import { guideModified } from "@/lib/guides/modified";
import { getLanguageGroups } from "@/lib/language-hubs";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import {
  agentsModified,
  checkModified,
  compareHubModified,
  compareModified,
  contributeModified,
  examplesModified,
  frameworkModified,
  guideHubModified,
  hubModified,
  languageExamplesModified,
  modelBoardModified,
  rowsModified,
  sizeReportModified,
  vsAgentsMdModified,
  vsClaudeMdModified,
} from "@/lib/page-dates";
import { SIGNALS } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { getTopicGroups } from "@/lib/topic-pages";
import { TOPICS_PATH, topicPath } from "@/lib/topics";
import { checkPath, checkSubPath, frameworkExamplesPath, languageExamplesPath } from "@/lib/utils/check-path";
import { COMPARE_PATH, comparePath } from "@/lib/utils/compare-path";
import { CONTRIBUTE_PATH } from "@/lib/utils/contribute-path";
import { GENERATOR_PATH } from "@/lib/utils/generator-path";
import { guidePath } from "@/lib/utils/guide-path";
import { hubPath, isHub, OTHER_LANGUAGES_PATH, otherLanguageGroups } from "@/lib/utils/language";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { PACKAGE_PATH } from "@/lib/utils/package-path";
import { repoPath } from "@/lib/utils/repo-path";
import {
  AI_POLICY_REPORT_PATH,
  CONTENTS_REPORT_PATH,
  REPORT_PATH,
  SIZE_REPORT_PATH,
  SKILLS_REPORT_PATH,
} from "@/lib/utils/report-path";
import { APP_URL } from "@/lib/version";

// Pages that show no date of their own; bump one when its copy changes. The board
// counts on /check, /language and /score don't move them (lib/page-dates.ts says why).
const ACTION_UPDATED = "2026-11-16";
const SKILL_UPDATED = "2026-11-18";
const ABOUT_UPDATED = "2026-11-25";
const ROADMAP_UPDATED = "2026-11-16";
const SCORE_UPDATED = "2026-11-22";
const PACKAGE_UPDATED = "2026-11-13";
const GENERATOR_UPDATED = "2026-11-22";
const LANGUAGES_UPDATED = "2026-11-25";
const CHECKS_UPDATED = "2026-11-16";

type Freq = MetadataRoute.Sitemap[number]["changeFrequency"];

function entry(path: string, priority: number, changeFrequency: Freq, date: string | null) {
  return { url: `${APP_URL}${path}`, priority, changeFrequency, lastModified: date ? new Date(date) : undefined };
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Each page takes the date it shows (lib/page-dates.ts); one with no dated source gets none.
  const { contentChangedAt } = getLeaderboardStats();
  const board = listLeaderboardOverall();

  const staticRoutes: MetadataRoute.Sitemap = [
    // The home page's Dataset is the whole board, so any repo's change is its change.
    entry("", 1, "daily", contentChangedAt != null ? new Date(contentChangedAt * 1000).toISOString() : null),
    entry("/score", 0.9, "weekly", SCORE_UPDATED),
    entry(PACKAGE_PATH, 0.8, "weekly", PACKAGE_UPDATED),
    entry("/action", 0.8, "monthly", ACTION_UPDATED),
    entry("/skill", 0.8, "monthly", SKILL_UPDATED),
    // Methodology and changelog change only in a release.
    entry("/methodology", 0.7, "monthly", LATEST_RELEASE_DATE),
    entry("/language", 0.7, "weekly", LANGUAGES_UPDATED),
    entry("/check", 0.8, "weekly", CHECKS_UPDATED),
    entry("/about", 0.5, "monthly", ABOUT_UPDATED),
    entry("/privacy", 0.3, "yearly", PRIVACY_UPDATED),
    entry("/terms", 0.3, "yearly", TERMS_UPDATED),
    entry("/roadmap", 0.6, "weekly", ROADMAP_UPDATED),
    entry("/changelog", 0.6, "weekly", LATEST_RELEASE_DATE),
    entry(checkSubPath("agents_md", "examples"), 0.8, "weekly", examplesModified()),
    entry(checkSubPath("agents_md", "vs-claude-md"), 0.8, "weekly", vsClaudeMdModified()),
    entry("/guide", 0.9, "weekly", guideHubModified()),
    ...Object.keys(VS_AGENTS_MD).map((id) =>
      entry(checkSubPath(id, "vs-agents-md"), 0.8, "weekly", vsAgentsMdModified(id)),
    ),
    entry("/agents", 0.8, "weekly", agentsModified()),
    entry(OTHER_LANGUAGES_PATH, 0.6, "weekly", rowsModified(otherLanguageGroups(board).flatMap((g) => g.rows))),
  ];

  const repoRoutes: MetadataRoute.Sitemap = board.map((r) => ({
    changeFrequency: "weekly",
    url: `${APP_URL}${repoPath(r)}`,
    lastModified: r.content_changed_at != null ? new Date(r.content_changed_at * 1000) : undefined,
    priority: r.score != null ? Math.round((0.3 + (r.score / 100) * 0.6) * 10) / 10 : 0.4,
  }));

  const hubRoutes = getLanguageGroups()
    .filter(isHub)
    .map((g) => entry(hubPath(g.slug), 0.8, "weekly", hubModified(g)));

  const topics = getTopicGroups();
  // /topics is noindex while no topic has a page.
  const topicRoutes =
    topics.length === 0
      ? []
      : [
          entry(TOPICS_PATH, 0.6, "weekly", rowsModified(topics.flatMap((t) => t.rows))),
          ...topics.map((t) => entry(topicPath(t.slug), 0.7, "weekly", rowsModified(t.rows))),
        ];

  const modelRoutes = MODELS.map((m) => entry(modelPath(m.id), 0.8, "daily", modelBoardModified(m.id)));

  const examples = getAgentsMdExamples();
  const examplesRoutes = [
    ...examplesByLanguage(examples).map((l) =>
      entry(languageExamplesPath(l.slug), 0.7, "weekly", languageExamplesModified(l)),
    ),
    ...examplesByFramework(examples).map((f) =>
      entry(frameworkExamplesPath(f.guide.slug), 0.7, "weekly", frameworkModified(f)),
    ),
  ];

  const checkRoutes = SIGNALS.map((s) => entry(checkPath(s.id), 0.8, "weekly", checkModified(s.id)));

  const guideRoutes = GUIDES.map((g) => entry(guidePath(g.slug), 0.8, "weekly", guideModified(g)));

  const pageRoutes = [
    entry(REPORT_PATH, 0.8, "daily", ADOPTION.points[ADOPTION.points.length - 1].date),
    entry(SIZE_REPORT_PATH, 0.7, "weekly", sizeReportModified()),
    entry(SKILLS_REPORT_PATH, 0.7, "weekly", getAgentSkillsReport().date),
    entry(AI_POLICY_REPORT_PATH, 0.7, "monthly", AI_POLICY.checked),
    entry(CONTENTS_REPORT_PATH, 0.7, "monthly", CONTENTS_REPORT.date),
    entry(CONTRIBUTE_PATH, 0.7, "weekly", contributeModified()),
    entry(COMPARE_PATH, 0.6, "weekly", compareHubModified()),
    ...COMPARE_PAIRS.map((p) => entry(comparePath(p.slug), 0.6, "weekly", compareModified(p))),
    entry(GENERATOR_PATH, 0.6, "weekly", GENERATOR_UPDATED),
  ];

  // No /package/<registry>/<name>: those pages are noindex (see their page.tsx).
  return [
    ...staticRoutes,
    ...checkRoutes,
    ...guideRoutes,
    ...pageRoutes,
    ...examplesRoutes,
    ...modelRoutes,
    ...hubRoutes,
    ...topicRoutes,
    ...repoRoutes,
  ];
}

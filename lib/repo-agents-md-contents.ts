import { TOPICS } from "./agents-md-contents";
import { CONTENTS_DATA, CONTENTS_REPORT } from "./agents-md-contents-data";
import { type ContentsData, type ContentsRead, type ContentsReport, isRead } from "./agents-md-contents-report";
import { CONTENTS_COMMON_SHARE, CONTENTS_MISSING_SHOWN } from "./constants/scoring";
import { formatDay, percent, plural } from "./utils/format";
import { type RepoIdentity, repoKey } from "./utils/repo-path";
import { CONTENTS_REPORT_PATH } from "./utils/report-path";

export type MissingTopic = { label: string; share: string };

export type RepoAgentsMdContents = {
  file: string;
  read: { iso: string; text: string };
  commit: string | null;
  covered: string[];
  missing: MissingTopic[];
  test: string;
  points: string;
  rules: string;
  files: number;
  reportHref: string;
};

function testLine(r: ContentsRead, report: ContentsReport): string {
  const single = percent(report.singleTest, report.files);
  if (r.singleTest) return `Names an exact test command and how to run a single test, as ${single} of files do.`;
  if (r.testCommand)
    return `Names an exact test command, but not how to run a single test, which ${single} of files show.`;
  return `No exact test command, which ${percent(report.testCommand, report.files)} of files give.`;
}

function pointsLine(r: ContentsRead, report: ContentsReport): string {
  const parts = [
    r.relativeLinks ? plural(r.relativeLinks, "relative link") : null,
    r.imports ? plural(r.imports, "import") : null,
    r.mdRefs ? `${plural(r.mdRefs, "other Markdown file")} by name` : null,
  ].filter(Boolean);
  if (parts.length > 0) return `${parts.join(", ")}.`;
  return `Doesn't link, import or name another Markdown file, which ${percent(report.pointsElsewhere, report.files)} of files do.`;
}

function rulesLine(r: ContentsRead, report: ContentsReport): string {
  if (!r.prohibitions)
    return `No never / do not / avoid line; ${percent(report.prohibitions, report.files)} of files have one.`;
  return `${plural(r.prohibitions, "never / do not / avoid line")}; the median file with any has ${report.medianProhibitions ?? 0}.`;
}

/**
 * What this repo's agent file covers, against every file the contents report read.
 * `scoredChars` is the length the board scores now: the data is refreshed by hand,
 * so a file edited since it was read shows nothing rather than a stale reading.
 */
export function repoAgentsMdContents(
  repo: RepoIdentity,
  scoredChars: number | null,
  data: ContentsData = CONTENTS_DATA,
  report: ContentsReport = CONTENTS_REPORT,
): RepoAgentsMdContents | null {
  const key = repoKey(repo);
  const r = data.repos.find((x) => repoKey(x) === key);
  if (!r || !isRead(r) || scoredChars == null || r.scoredChars !== scoredChars) return null;
  const covered = new Set(r.topics);
  const date = data.generatedAt.slice(0, 10);

  return {
    file: r.path,
    read: { iso: date, text: formatDay(date) },
    commit: r.sha ? r.sha.slice(0, 7) : null,
    covered: TOPICS.filter((t) => covered.has(t.id)).map((t) => t.label),
    missing: report.topics
      .filter((t) => !covered.has(t.id) && t.files / report.files >= CONTENTS_COMMON_SHARE)
      .slice(0, CONTENTS_MISSING_SHOWN)
      .map((t) => ({ label: t.label, share: percent(t.files, report.files) })),
    test: testLine(r, report),
    points: pointsLine(r, report),
    rules: rulesLine(r, report),
    files: report.files,
    reportHref: CONTENTS_REPORT_PATH,
  };
}
